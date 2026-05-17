// Reddit 어댑터 — old.reddit.com 의 .json 엔드포인트 사용 (인증 불필요, IP 기반 rate-limit).
// 키워드 단건 검색 → 핫 포스트 → 각 포스트 댓글 top-N.
// User-Agent 필수 (Reddit 정책).

import type { FetchOpts, RawEvidence, SourceAdapter } from "./types";

const UA = "ai-trainer-hub/0.1 (+https://nowlink.kr)";

type SearchPost = {
  data: {
    id: string;
    title: string;
    selftext: string;
    permalink: string;
    author: string;
    subreddit: string;
    score: number;
    num_comments: number;
    created_utc: number;
  };
};
type SearchResp = { data: { children: SearchPost[] } };

type CommentItem = {
  kind: string;
  data: {
    id: string;
    body?: string;
    author?: string;
    score?: number;
    created_utc?: number;
    permalink?: string;
  };
};
type CommentsResp = [unknown, { data: { children: CommentItem[] } }];

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`Reddit ${r.status} on ${url.slice(0, 120)}`);
  return (await r.json()) as T;
}

export const redditAdapter: SourceAdapter = {
  platform: "reddit",

  isAvailable() {
    return true; // 공개 JSON, 키 불필요
  },

  async fetchByKeyword(keyword: string, opts: FetchOpts = {}): Promise<RawEvidence[]> {
    const limit = Math.min(opts.limit ?? 10, 25);
    const sinceTs = (opts.since ?? new Date(Date.now() - 90 * 86_400_000)).getTime() / 1000;

    // 1) 글로벌 search (sort=relevance, t=year)
    const searchUrl =
      `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}` +
      `&sort=relevance&t=year&limit=${limit}&type=link`;
    const search = await jget<SearchResp>(searchUrl);

    const posts = (search.data.children ?? []).filter((p) => p.data.created_utc >= sinceTs);

    const commentsPerPost = 10;
    const commentBatches = await Promise.all(
      posts.map(async (p) => {
        try {
          const url = `https://www.reddit.com${p.data.permalink}.json?limit=${commentsPerPost}&sort=top`;
          return await jget<CommentsResp>(url);
        } catch {
          return null;
        }
      }),
    );

    const out: RawEvidence[] = [];
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i].data;
      const postUrl = `https://www.reddit.com${p.permalink}`;
      const parentTitle = p.title;
      const parentChannel = `r/${p.subreddit}`;

      // 포스트 본문 자체도 selftext가 있으면 evidence로
      if (p.selftext && p.selftext.trim().length > 20) {
        out.push({
          platform: "reddit",
          sourceUrl: postUrl,
          author: p.author,
          textRaw: p.selftext,
          lang: detectLang(p.selftext),
          postedAt: new Date(p.created_utc * 1000),
          upvotes: p.score,
          replies: p.num_comments,
          parentTitle,
          parentChannel,
          keyword,
        });
      }

      // 댓글
      const batch = commentBatches[i];
      if (!batch || !batch[1]) continue;
      for (const c of batch[1].data.children) {
        if (c.kind !== "t1" || !c.data.body || !c.data.author) continue;
        if (c.data.author === "[deleted]" || c.data.body === "[deleted]") continue;
        out.push({
          platform: "reddit",
          sourceUrl: c.data.permalink
            ? `https://www.reddit.com${c.data.permalink}`
            : postUrl,
          author: c.data.author,
          textRaw: c.data.body,
          lang: detectLang(c.data.body),
          postedAt: new Date((c.data.created_utc ?? p.created_utc) * 1000),
          upvotes: c.data.score ?? 0,
          parentTitle,
          parentChannel,
          keyword,
        });
      }
    }
    return out;
  },
};

function detectLang(text: string): string {
  return /[가-힣]/.test(text) ? "ko" : /[ぁ-んァ-ン一-龥]/.test(text) ? "ja" : "en";
}
