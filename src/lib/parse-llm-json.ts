/**
 * Claude API 응답에서 JSON 객체를 robust하게 추출 + 파싱.
 *
 * Claude가 markdown 코드블록 / 설명 텍스트 / 문자열 안 unescaped 줄바꿈 등을
 * 섞어 보내도 안전하게 첫 정상 JSON 객체를 추출.
 *
 * 처리 순서:
 *   1. markdown 코드펜스 제거
 *   2. balanced bracket scanner로 첫 { ... } 블록 추출 (문자열 안 괄호 무시)
 *   3. 문자열 안 raw 줄바꿈을 \\n 으로 escape (Claude 흔한 실수)
 *   4. JSON.parse 시도 → 실패 시 다시 한 번 sanitize 적용
 */
export function parseLLMJson<T = unknown>(raw: string): { ok: true; data: T } | { ok: false; error: string; raw: string } {
  if (!raw) return { ok: false, error: "empty response", raw };

  // 1) 코드펜스 제거
  let text = raw.replace(/```json\s*|\s*```/g, "").trim();

  // 2) balanced bracket scanner — 첫 { ... }
  const block = extractFirstJsonBlock(text);
  if (!block) return { ok: false, error: "no JSON object found", raw: text.slice(0, 500) };
  text = block;

  // 3) try parse → 실패 시 escape 줄바꿈 후 재시도
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    const sanitized = escapeStringNewlines(text);
    try {
      return { ok: true, data: JSON.parse(sanitized) as T };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg, raw: text.slice(0, 500) };
    }
  }
}

/** balanced bracket scanner — 첫 { } 블록 (문자열·escape 인식) */
function extractFirstJsonBlock(s: string): string | null {
  const start = s.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/** JSON 문자열 안의 raw 줄바꿈/탭을 escape sequence로 변환 (Claude 흔한 실수 대응) */
function escapeStringNewlines(s: string): string {
  let out = "";
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      out += c;
      escape = false;
      continue;
    }
    if (c === "\\") {
      out += c;
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      out += c;
      continue;
    }
    if (inString && c === "\n") {
      out += "\\n";
      continue;
    }
    if (inString && c === "\r") {
      out += "\\r";
      continue;
    }
    if (inString && c === "\t") {
      out += "\\t";
      continue;
    }
    out += c;
  }
  return out;
}
