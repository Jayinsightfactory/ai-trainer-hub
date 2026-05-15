/**
 * Claude API 응답에서 JSON 객체를 robust하게 추출 + 파싱 + 마크다운 자동 제거.
 *
 * Claude가 markdown 코드블록 / 설명 텍스트 / 문자열 안 unescaped 줄바꿈 등을
 * 섞어 보내도 안전하게 첫 정상 JSON 객체를 추출하고,
 * 결과 객체의 모든 string 필드에서 **bold** / *italic* / `code` 등 마크다운을 제거한다.
 * (AI가 만든 티가 나는 ** 같은 문자가 카드뉴스 화면에 나오지 않도록 보호)
 */
export function parseLLMJson<T = unknown>(raw: string): { ok: true; data: T } | { ok: false; error: string; raw: string } {
  if (!raw) return { ok: false, error: "empty response", raw };

  // 1) 코드펜스 제거
  let text = raw.replace(/```json\s*|\s*```/g, "").trim();

  // 2) balanced bracket scanner — 첫 { ... }
  const block = extractFirstJsonBlock(text);
  if (!block) return { ok: false, error: "no JSON object found", raw: text.slice(0, 500) };
  text = block;

  // 3) try parse → 실패 시 (a) trailing comma 제거 → (b) 줄바꿈 escape → (c) 둘 다 적용 순으로 재시도
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    const candidates = [
      stripTrailingCommas(text),
      escapeStringNewlines(text),
      escapeStringNewlines(stripTrailingCommas(text)),
    ];
    let parsed = false;
    let lastErr = "";
    for (const c of candidates) {
      try {
        data = JSON.parse(c);
        parsed = true;
        break;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }
    if (!parsed) return { ok: false, error: lastErr, raw: text.slice(0, 500) };
  }

  // 4) 결과 객체 모든 string 필드에서 마크다운 제거
  return { ok: true, data: stripMarkdownDeep(data) as T };
}

/** 문자열 안 마크다운 표기 제거 (AI 작성 티 제거) */
function stripMarkdown(s: string): string {
  return s
    // bold/italic
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
    .replace(/__([^_]+)__/g, "$1") // __bold__
    .replace(/(?<![*\w])\*([^*\n]+)\*(?![*\w])/g, "$1") // *italic*
    .replace(/(?<![_\w])_([^_\n]+)_(?![_\w])/g, "$1") // _italic_
    // inline code · link · 헤딩 · 리스트 마커
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    // 잔여 ** / __ (짝 안 맞는 케이스)
    .replace(/\*\*+/g, "")
    .replace(/__+/g, "")
    .trim();
}

/** 객체/배열을 deep walk하며 모든 string 필드에 stripMarkdown 적용 */
function stripMarkdownDeep(node: unknown): unknown {
  if (typeof node === "string") return stripMarkdown(node);
  if (Array.isArray(node)) return node.map(stripMarkdownDeep);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = stripMarkdownDeep(v);
    }
    return out;
  }
  return node;
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

/** JSON에서 `,]` `,}` 같은 trailing comma 제거 (문자열 안 콤마는 보호) */
function stripTrailingCommas(s: string): string {
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
    if (!inString && c === ",") {
      // lookahead — 다음 non-whitespace가 ] 또는 } 면 콤마 skip
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      if (s[j] === "]" || s[j] === "}") continue;
    }
    out += c;
  }
  return out;
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
