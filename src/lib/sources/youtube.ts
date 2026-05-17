// YouTube Data API v3 어댑터.
// 1) search.list 로 키워드 → 영상 IDs (조회수/최근성 정렬)
// 2) commentThreads.list 로 각 영상 top 댓글 추출
// 3) 댓글 1개 = Evidence 1개 (textRaw 그대로 보존, sourceUrl = 영상 URL)

import type { FetchOpts, RawEvidence, SourceAdapter } from "./types";

const SEARCH = "https://www.googleapis.com/youtube/v3/search";
const VIDEOS = "https://www.googleapis.com/youtube/v3/videos";
const COMMENTS = "https://www.googleapis.com/youtube/v3/commentThreads";

type SearchItem = { id: { videoId: string } };
type SearchResp = { items?: SearchItem[] };

type VideoStats = {
  id: string;
  snippet: { title: string; channelTitle: string; publishedAt: string };
  statistics: { viewCount?: string; likeCount?: string };
};
type VideosResp = { items?: VideoStats[] };

type CommentItem = {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: {
        authorDisplayName: string;
        authorChannelUrl?: string;
        textOriginal: string;
        likeCount?: number;
        publishedAt: string;
      };
    };
    totalReplyCount?: number;
  };
};
type CommentsResp = { items?: CommentItem[] };

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`YT ${r.status} ${r.statusText} on ${url.slice(0, 120)}`);
  return (await r.json()) as T;
}

export const youtubeAdapter: SourceAdapter = {
  platform: "youtube",

  isAvailable() {
    return Boolean(process.env.YOUTUBE_API_KEY);
  },

  async fetchByKeyword(keyword: string, opts: FetchOpts = {}): Promise<RawEvidence[]> {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) throw new Error("YOUTUBE_API_KEY missing");

    const since = opts.since ?? new Date(Date.now() - 90 * 86_400_000);
    const videoLimit = Math.min(opts.limit ?? 10, 25);
    const commentsPerVideo = 20;
    // 한국어 키워드면 한국 영상 우선 (regionCode + relevanceLanguage)
    const isKorean = /[가-힣]/.test(keyword);
    const langParam = isKorean ? "&relevanceLanguage=ko&regionCode=KR" : "";

    // 1) 영상 검색 (relevance + 한국어 가중)
    const searchUrl =
      `${SEARCH}?part=snippet&type=video&maxResults=${videoLimit * 2}` + // 2배 가져와서 제목 필터 후 자르기
      `&order=relevance&publishedAfter=${since.toISOString()}${langParam}` +
      `&q=${encodeURIComponent(keyword)}&key=${key}`;
    const search = await jget<SearchResp>(searchUrl);
    let videoIds = (search.items ?? []).map((it) => it.id.videoId).filter(Boolean);
    if (videoIds.length === 0) return [];

    // 2) 영상 메타 (조회수, 제목)
    const videosUrl =
      `${VIDEOS}?part=snippet,statistics&id=${videoIds.join(",")}&key=${key}`;
    const videos = await jget<VideosResp>(videosUrl);
    const metaById = new Map(
      (videos.items ?? []).map((v) => [v.id, v]),
    );

    // 2.5) 키워드 토큰이 영상 제목 또는 채널명에 들어가는 영상만 (느슨 매칭 — 한 토큰만 포함돼도 OK)
    const tokens = keyword
      .toLowerCase()
      .split(/[\s,·]+/)
      .filter((t) => t.length >= 2);
    if (tokens.length > 0) {
      const matched = videoIds.filter((vid) => {
        const meta = metaById.get(vid);
        if (!meta) return true; // 메타 없으면 일단 통과
        const hay = `${meta.snippet.title} ${meta.snippet.channelTitle}`.toLowerCase();
        return tokens.some((t) => hay.includes(t));
      });
      // 너무 빡빡하면 fallback (최소 3개는 남도록)
      if (matched.length >= 3) videoIds = matched;
    }
    videoIds = videoIds.slice(0, videoLimit);

    // 3) 영상별 댓글 — 병렬, 단 댓글 disabled 영상은 skip
    const commentBatches = await Promise.all(
      videoIds.map(async (vid) => {
        try {
          const cUrl =
            `${COMMENTS}?part=snippet&videoId=${vid}` +
            `&maxResults=${commentsPerVideo}&order=relevance&key=${key}`;
          return await jget<CommentsResp>(cUrl);
        } catch {
          return { items: [] };
        }
      }),
    );

    const out: RawEvidence[] = [];
    for (let i = 0; i < videoIds.length; i++) {
      const vid = videoIds[i];
      const meta = metaById.get(vid);
      const videoUrl = `https://www.youtube.com/watch?v=${vid}`;
      const parentTitle = meta?.snippet.title;
      const parentChannel = meta?.snippet.channelTitle;
      const parentViews = meta?.statistics.viewCount ? Number(meta.statistics.viewCount) : undefined;

      for (const c of commentBatches[i]?.items ?? []) {
        const s = c.snippet.topLevelComment.snippet;
        out.push({
          platform: "youtube",
          sourceUrl: `${videoUrl}&lc=${c.id}`,
          author: s.authorDisplayName,
          authorUrl: s.authorChannelUrl,
          textRaw: s.textOriginal,
          lang: detectLang(s.textOriginal),
          postedAt: new Date(s.publishedAt),
          likes: s.likeCount ?? 0,
          replies: c.snippet.totalReplyCount ?? 0,
          parentTitle,
          parentChannel,
          parentViews,
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
