#!/usr/bin/env ts-node
/**
 * 네이버 플레이스 업체 정보 수집 스크립트
 *
 * 사용법:
 *   npx ts-node scripts/collect-businesses.ts --category cafe --location 서울 --limit 50
 *
 * 환경변수 없으면 Mock 데이터로 동작.
 */

import fs from "fs";
import path from "path";
import https from "https";

interface BusinessInfo {
  id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  naverPlaceUrl: string;
  naverPlaceId: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  contactStatus: "pending" | "contacted" | "responded" | "converted";
  collectedAt: string;
}

interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

interface NaverLocalResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverLocalItem[];
}

const TARGET_CATEGORIES: Record<string, string> = {
  cafe: "카페",
  restaurant: "식당",
  fitness: "헬스장",
  pilates: "필라테스",
  study_cafe: "스터디카페",
  beauty: "미용실",
  nail: "네일샵",
  academy: "학원",
};

const BUSINESSES_PATH = path.join(process.cwd(), "data", "businesses.json");
const DATA_DIR = path.dirname(BUSINESSES_PATH);

function parseArgs(): { category: string; location: string; limit: number } {
  const args = process.argv.slice(2);
  const get = (flag: string, def: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
  };
  return {
    category: get("--category", "cafe"),
    location: get("--location", "서울"),
    limit: parseInt(get("--limit", "20"), 10),
  };
}

function readExisting(): BusinessInfo[] {
  try {
    const raw = fs.readFileSync(BUSINESSES_PATH, "utf-8");
    return JSON.parse(raw) as BusinessInfo[];
  } catch {
    return [];
  }
}

function writeBusinesses(businesses: BusinessInfo[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(BUSINESSES_PATH, JSON.stringify(businesses, null, 2), "utf-8");
}

function naverItemToBusinessInfo(
  item: NaverLocalItem,
  category: string
): BusinessInfo {
  // 네이버 플레이스 ID는 link URL에서 추출
  const linkMatch = item.link.match(/\?id=(\d+)/);
  const placeId = linkMatch ? linkMatch[1] : Math.random().toString(36).slice(2, 11);

  // HTML 태그 제거
  const cleanName = item.title.replace(/<[^>]+>/g, "");

  return {
    id: `biz_${category}_${placeId}`,
    name: cleanName,
    category,
    address: item.roadAddress || item.address,
    phone: item.telephone || undefined,
    naverPlaceUrl: item.link || `https://map.naver.com/v5/entry/place/${placeId}`,
    naverPlaceId: placeId,
    contactStatus: "pending",
    collectedAt: new Date().toISOString(),
  };
}

function fetchNaverSearch(
  query: string,
  display: number,
  clientId: string,
  clientSecret: string
): Promise<NaverLocalResponse> {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(query);
    const options = {
      hostname: "openapi.naver.com",
      path: `/v1/search/local.json?query=${encoded}&display=${display}&start=1&sort=random`,
      method: "GET",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data) as NaverLocalResponse);
        } catch {
          reject(new Error("JSON 파싱 실패: " + data));
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

function generateMockData(
  category: string,
  location: string,
  count: number
): BusinessInfo[] {
  const categoryLabel = TARGET_CATEGORIES[category] || category;
  const mockNames: Record<string, string[]> = {
    cafe: ["아늑한커피", "모닝브루", "선셋카페", "더 로스터리", "브리즈카페"],
    restaurant: ["맛있는식당", "어머니밥상", "골목식당", "한솥밥", "참맛식당"],
    fitness: ["파워짐", "피트니스클럽", "바디웍스", "스포츠센터", "액티브짐"],
    pilates: ["코어필라테스", "바디밸런스", "필라테스스튜디오", "움직임연구소", "플렉스필라테스"],
    study_cafe: ["공부의 방", "스터디파크", "집중카페", "북카페24", "조용한공간"],
    beauty: ["예쁜미용실", "헤어스타일", "모발연구소", "뷰티살롱", "트렌드헤어"],
    nail: ["핑크네일", "젤네일살롱", "아트네일", "네일아트하우스", "큐티네일"],
    academy: ["강남학원", "수학의힘", "영어마스터", "과학탐구", "독서논술"],
  };

  const names = mockNames[category] || mockNames["cafe"] || [];
  const districts = ["강남구", "마포구", "성동구", "송파구", "용산구", "관악구", "종로구", "서대문구"];

  return Array.from({ length: Math.min(count, names.length * 2) }, (_, i) => {
    const name = `${names[i % names.length]} ${location} ${Math.floor(i / names.length) + 1}호점`;
    const district = districts[i % districts.length];
    const placeId = `mock${category}${i + 1}`.padEnd(10, "0");

    return {
      id: `biz_${category}_mock_${i + 1}`,
      name,
      category,
      address: `${location} ${district} 테스트로 ${(i + 1) * 10}`,
      phone: `02-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      naverPlaceUrl: `https://map.naver.com/v5/entry/place/${placeId}`,
      naverPlaceId: placeId,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviewCount: Math.floor(50 + Math.random() * 500),
      contactStatus: "pending" as const,
      collectedAt: new Date().toISOString(),
    };
  });
}

async function main() {
  const { category, location, limit } = parseArgs();

  const categoryLabel = TARGET_CATEGORIES[category];
  if (!categoryLabel) {
    console.error(`지원하지 않는 카테고리: ${category}`);
    console.error(`사용 가능한 카테고리: ${Object.keys(TARGET_CATEGORIES).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n네이버 플레이스 업체 수집 시작`);
  console.log(`카테고리: ${categoryLabel} (${category})`);
  console.log(`지역: ${location}`);
  console.log(`수집 목표: ${limit}개\n`);

  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  let newItems: BusinessInfo[] = [];

  if (clientId && clientSecret) {
    console.log("네이버 검색 API로 실제 데이터 수집 중...");
    try {
      const query = `${location} ${categoryLabel}`;
      const response = await fetchNaverSearch(query, Math.min(limit, 5), clientId, clientSecret);

      if (response.items && response.items.length > 0) {
        newItems = response.items.map((item) =>
          naverItemToBusinessInfo(item, category)
        );
        console.log(`API에서 ${newItems.length}개 업체 수집 완료`);
      } else {
        console.log("API 결과 없음 — Mock 데이터로 전환");
        newItems = generateMockData(category, location, limit);
      }
    } catch (err) {
      console.warn("API 호출 실패, Mock 데이터 사용:", err instanceof Error ? err.message : err);
      newItems = generateMockData(category, location, limit);
    }
  } else {
    console.log("NAVER_SEARCH_CLIENT_ID / NAVER_SEARCH_CLIENT_SECRET 미설정");
    console.log("Mock 데이터로 동작합니다\n");
    newItems = generateMockData(category, location, limit);
  }

  // 기존 데이터 로드 후 중복 제거 (naverPlaceId 기준)
  const existing = readExisting();
  const existingIds = new Set(existing.map((b) => b.naverPlaceId));

  const toAdd = newItems.filter((item) => !existingIds.has(item.naverPlaceId));
  const merged = [...existing, ...toAdd];

  writeBusinesses(merged);

  console.log(`\n결과:`);
  console.log(`  신규 추가: ${toAdd.length}개`);
  console.log(`  중복 스킵: ${newItems.length - toAdd.length}개`);
  console.log(`  전체 업체: ${merged.length}개`);
  console.log(`  저장 경로: ${BUSINESSES_PATH}\n`);

  if (toAdd.length > 0) {
    console.log("추가된 업체 목록:");
    toAdd.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.name} — ${b.address}`);
    });
  }
}

main().catch((err) => {
  console.error("오류:", err);
  process.exit(1);
});
