// 클리앙 검색 → 글 + 댓글 HTML 스크래핑.
// HTML 구조가 바뀌면 selector 조정 필요 — 변경 시 이 파일만 수정.
// cheerio 안 쓰고 정규식만 사용 (의존성 0).

import type { FetchOpts, RawEvidence, SourceAdapter } from "./types";

// 봇 식별 UA는 차단되기 쉬워 평범한 데스크탑 UA 사용.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const BASE = "https://www.clien.net";

async function htmlGet(url: string): Promise<string> {
  const r = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
    },
  });
  if (!r.ok) throw new Error(`Clien ${r.status} on ${url.slice(0, 120)}`);
  return await r.text();
}

/** 검색 결과에서 게시글 링크 추출 — /service/board/XXX/12345 형태.
 *  Clien 검색은 ?combine=true&q=... 쿼리가 붙은 형태로 노출. */
function extractPostLinks(html: string, limit: number): string[] {
  const links = new Set<string>();
  // subject_fixed 클래스가 검색 결과 게시글 링크임 (단순 메뉴 링크 제외)
  const re = /href="(\/service\/board\/[a-zA-Z0-9_]+\/\d+)[^"]*"\s+class="subject_fixed"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && links.size < limit) {
    links.add(BASE + m[1]);
  }
  // fallback: subject_fixed 못 찾으면 모든 board 링크
  if (links.size === 0) {
    const reAny = /href="(\/service\/board\/[a-zA-Z0-9_]+\/\d+)(?:\?[^"]*)?"/g;
    while ((m = reAny.exec(html)) && links.size < limit) {
      links.add(BASE + m[1]);
    }
  }
  return [...links];
}

/** 게시글 페이지에서 본문/댓글 파싱 (간단판). */
interface ClienPost {
  title: string;
  author: string;
  postedAt: Date;
  bodyText: string;
  upvotes: number;
  views: number;
  comments: Array<{ author: string; text: string; upvotes: number; postedAt: Date }>;
}

function parsePost(html: string, url: string): ClienPost | null {
  const title = unescapeHtml(pick(html, /<meta property="og:title" content="([^"]+)"/));
  const bodyRaw =
    pick(html, /<div class="post_view">([\s\S]*?)<\/div>\s*<div class="post_btn/) ||
    pick(html, /<article[^>]*>([\s\S]*?)<\/article>/);
  const bodyText = stripTags(bodyRaw).trim();
  const author =
    unescapeHtml(pick(html, /<span class="nickname"[^>]*>([^<]+)<\/span>/)) || "익명";
  const postedAtStr = pick(html, /<span class="post_author"[^>]*>[\s\S]*?<span class="date"[^>]*title="([^"]+)"/);
  const postedAt = postedAtStr ? new Date(postedAtStr.replace(" ", "T") + "+09:00") : new Date();
  const upvotes = Number(pick(html, /<a class="symph_count[^"]*"[^>]*>[\s\S]*?<strong>(\d+)<\/strong>/)) || 0;
  const views = Number(pick(html, /조회\s*[:：]?\s*<[^>]+>([\d,]+)<\/[^>]+>/)?.replace(/,/g, "")) || 0;

  if (!title || !bodyText) {
    void url; // suppress unused
    return null;
  }

  // 댓글: <div class="comment_row"> 단위
  const commentBlocks = [...html.matchAll(/<div class="comment_row[^"]*"[\s\S]*?<\/div>\s*<\/div>/g)].map(
    (m) => m[0],
  );
  const comments: ClienPost["comments"] = [];
  for (const block of commentBlocks) {
    const text = stripTags(
      pick(block, /<div class="comment_view[^"]*"[\s\S]*?<div class="comment_content[^"]*">([\s\S]*?)<\/div>/) || "",
    ).trim();
    if (!text || text.length < 5) continue;
    const cAuthor = unescapeHtml(pick(block, /<span class="nickname"[^>]*>([^<]+)<\/span>/) || "익명");
    const cUp = Number(pick(block, /<a class="symph_count[^"]*"[^>]*>[\s\S]*?<strong>(\d+)<\/strong>/) || "0");
    const cTs = pick(block, /<span class="timestamp"[^>]*>([^<]+)<\/span>/) || "";
    comments.push({
      author: cAuthor,
      text,
      upvotes: cUp,
      postedAt: cTs ? new Date(cTs.replace(" ", "T") + "+09:00") : postedAt,
    });
  }

  return { title, author, postedAt, bodyText, upvotes, views, comments };
}

export const clienAdapter: SourceAdapter = {
  platform: "clien",

  isAvailable() {
    // 환경변수로 끄고 켤 수 있게 — 스크래핑이라 보수적으로
    return process.env.CLIEN_ENABLED !== "0";
  },

  async fetchByKeyword(keyword: string, opts: FetchOpts = {}): Promise<RawEvidence[]> {
    const limit = Math.min(opts.limit ?? 8, 15);
    const searchUrl = `${BASE}/service/search?q=${encodeURIComponent(keyword)}&sort=recency&boardCd=&isBoard=false`;
    const html = await htmlGet(searchUrl);
    const postLinks = extractPostLinks(html, limit);
    if (postLinks.length === 0) return [];

    const out: RawEvidence[] = [];
    const since = opts.since ?? new Date(Date.now() - 365 * 86_400_000);

    for (const link of postLinks) {
      try {
        const pageHtml = await htmlGet(link);
        const post = parsePost(pageHtml, link);
        if (!post || post.postedAt < since) continue;

        // 본문이 의미 있을 때만 evidence (제목만 있는 짧은 글 제외)
        if (post.bodyText.length >= 20) {
          out.push({
            platform: "clien",
            sourceUrl: link,
            author: post.author,
            textRaw: post.bodyText,
            lang: "ko",
            postedAt: post.postedAt,
            upvotes: post.upvotes,
            replies: post.comments.length,
            parentTitle: post.title,
            parentViews: post.views,
            keyword,
          });
        }
        // 댓글
        for (const c of post.comments) {
          out.push({
            platform: "clien",
            sourceUrl: link,
            author: c.author,
            textRaw: c.text,
            lang: "ko",
            postedAt: c.postedAt,
            upvotes: c.upvotes,
            parentTitle: post.title,
            keyword,
          });
        }
      } catch {
        // 한 게시글 실패해도 나머지는 진행
      }
    }
    return out;
  },
};

// ─── tiny html helpers (no deps) ────────────────────────
function pick(s: string, re: RegExp): string {
  return s.match(re)?.[1] ?? "";
}
function stripTags(s: string): string {
  return unescapeHtml(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
}
function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
