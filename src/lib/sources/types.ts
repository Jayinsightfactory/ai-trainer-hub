// 다중 소스 어댑터 공통 타입.
// 새 소스 추가 시: types만 import → fetchByKeyword 한 함수만 구현 → index.ts 등록.

export type Platform =
  | "youtube"
  | "reddit"
  | "clien"
  | "ppomppu"
  | "x"
  | "facebook";

export interface RawEvidence {
  platform: Platform;
  sourceUrl: string;
  author: string;
  authorUrl?: string;
  textRaw: string;
  lang?: string;
  postedAt: Date;

  upvotes?: number;
  likes?: number;
  replies?: number;

  parentTitle?: string;
  parentChannel?: string;
  parentViews?: number;

  keyword: string;
}

export interface FetchOpts {
  /** 이 시점 이후 게시물만 (없으면 최근 90일) */
  since?: Date;
  /** 키워드당 최대 수집 수 (없으면 어댑터 기본) */
  limit?: number;
}

export interface SourceAdapter {
  platform: Platform;
  /** 키 없거나 disabled면 false — ingest 시 스킵 */
  isAvailable(): boolean;
  fetchByKeyword(keyword: string, opts?: FetchOpts): Promise<RawEvidence[]>;
}
