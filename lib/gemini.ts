import { GoogleGenAI, Type } from "@google/genai";
import {
  AGENT_SYSTEM,
  TIMELINE_SYSTEM,
  WEEKLY_SYSTEM,
  PHOTO_SYSTEM,
} from "./prompts";
import type {
  AgentTurn,
  AssetCategory,
  Domain,
  Intensity,
  TimelineHorizon,
  WhenLabel,
} from "./types";

// Gemini 2.5 Flash 무료 티어. 키는 서버 전용 환경변수 GEMINI_API_KEY.
// (변경 스펙: 프론트엔드 노출 금지 — serverless route에서만 호출)
const MODEL = "gemini-2.5-flash";

let ai: GoogleGenAI | null = null;

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function getClient(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// 무료 티어는 일시적 503(과부하)/429(쿼터)가 잦다. 짧게 1회 재시도.
// Vercel Hobby 10초 예산 안에 들도록 지연을 작게 유지.
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
  delayMs = 600,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const transient = status === 503 || status === 429 || status === 500;
      if (!transient || attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// 단일 호출 스키마 — 분류 + 미래의 나 메시지를 한 번에.
const TURN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    domain: {
      type: Type.STRING,
      enum: ["운동", "공부", "수면", "정리", "식습관", "관계", "기타"],
    },
    intensity: { type: Type.STRING, enum: ["normal", "high"] },
    is_completion: { type: Type.BOOLEAN },
    is_crisis: { type: Type.BOOLEAN },
    asset: {
      type: Type.STRING,
      enum: ["체력", "집중", "회복", "정리", "자기신뢰"],
    },
    message: { type: Type.STRING },
  },
  required: [
    "domain",
    "intensity",
    "is_completion",
    "is_crisis",
    "asset",
    "message",
  ],
  propertyOrdering: [
    "domain",
    "intensity",
    "is_completion",
    "is_crisis",
    "asset",
    "message",
  ],
};

const DOMAINS: Domain[] = [
  "운동",
  "공부",
  "수면",
  "정리",
  "식습관",
  "관계",
  "기타",
];

// 단일 LLM 호출. 10초 타임아웃 대응으로 thinking 비활성화(thinkingBudget: 0).
export async function runAgentTurn(
  userText: string,
  context?: string,
): Promise<AgentTurn> {
  // 직전 사용자 메시지를 맥락으로 주면 Min Action/코칭이 구체적이 된다.
  const contents = context
    ? `직전에 사용자가 한 말(맥락): "${context}"\n지금 사용자의 말: "${userText}"\n\n분류와 message는 '지금 사용자의 말'을 기준으로 하되, 맥락의 구체적 활동을 활용해라.`
    : userText;
  const res = await withRetry(() =>
    getClient().models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: AGENT_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: TURN_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.8,
        maxOutputTokens: 600,
      },
    }),
  );

  const raw = res.text;
  if (!raw) throw new Error("Gemini가 빈 응답을 반환했습니다.");

  const parsed = JSON.parse(raw) as Partial<AgentTurn>;

  const domain: Domain = DOMAINS.includes(parsed.domain as Domain)
    ? (parsed.domain as Domain)
    : "기타";
  const intensity: Intensity = parsed.intensity === "high" ? "high" : "normal";

  const asset: AssetCategory = ASSETS.includes(parsed.asset as AssetCategory)
    ? (parsed.asset as AssetCategory)
    : "자기신뢰";

  return {
    domain,
    intensity,
    is_completion: Boolean(parsed.is_completion),
    is_crisis: Boolean(parsed.is_crisis),
    asset,
    message: typeof parsed.message === "string" ? parsed.message.trim() : "",
  };
}

// 두 번째 호출 — 8.2 타임라인 5장. normal 분기에서만 호출.
const WHEN_ORDER: WhenLabel[] = [
  "30분 뒤",
  "오늘 밤",
  "1주 뒤",
  "1개월 뒤",
  "3개월 뒤",
];
const ASSETS: AssetCategory[] = ["체력", "집중", "회복", "정리", "자기신뢰"];

const TIMELINE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    horizons: {
      type: Type.ARRAY,
      minItems: 5,
      maxItems: 5,
      items: {
        type: Type.OBJECT,
        properties: {
          when: { type: Type.STRING, enum: WHEN_ORDER },
          scene: { type: Type.STRING },
          image_keyword: { type: Type.STRING },
          asset: { type: Type.STRING, enum: ASSETS },
        },
        required: ["when", "scene", "image_keyword", "asset"],
        propertyOrdering: ["when", "scene", "image_keyword", "asset"],
      },
    },
  },
  required: ["horizons"],
  propertyOrdering: ["horizons"],
};

export async function generateTimeline(
  userText: string,
  domain: Domain,
): Promise<TimelineHorizon[]> {
  const res = await withRetry(() =>
    getClient().models.generateContent({
      model: MODEL,
      contents: `목표 행동(도메인: ${domain}): ${userText}`,
      config: {
        systemInstruction: TIMELINE_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: TIMELINE_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.9,
        maxOutputTokens: 1000,
      },
    }),
  );

  const raw = res.text;
  if (!raw) throw new Error("Gemini가 빈 타임라인을 반환했습니다.");

  const parsed = JSON.parse(raw) as { horizons?: Partial<TimelineHorizon>[] };
  const horizons = Array.isArray(parsed.horizons) ? parsed.horizons : [];

  // 시점 순서를 앱이 강제(모델이 어긋나도 5장·고정 순서 보장).
  return WHEN_ORDER.map((when, i) => {
    const h = horizons[i] ?? {};
    return {
      when,
      scene: typeof h.scene === "string" && h.scene.trim() ? h.scene.trim() : "",
      image_keyword:
        typeof h.image_keyword === "string" ? h.image_keyword : "",
      asset: ASSETS.includes(h.asset as AssetCategory)
        ? (h.asset as AssetCategory)
        : "자기신뢰",
    };
  });
}

// 8.3 사진 분석 (vision) — {reframe, state_summary}. 사진은 분석에만 쓰고 저장하지 않는다.
const PHOTO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reframe: { type: Type.STRING },
    state_summary: { type: Type.STRING },
  },
  required: ["reframe", "state_summary"],
  propertyOrdering: ["reframe", "state_summary"],
};

export async function analyzePhoto(
  base64: string,
  mimeType: string,
): Promise<{ reframe: string; state_summary: string }> {
  const res = await withRetry(() =>
    getClient().models.generateContent({
      model: MODEL,
      contents: [
        { inlineData: { mimeType, data: base64 } },
        { text: "이 사진을 분석해줘." },
      ],
      config: {
        systemInstruction: PHOTO_SYSTEM,
        responseMimeType: "application/json",
        responseSchema: PHOTO_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.7,
        maxOutputTokens: 400,
      },
    }),
  );

  const raw = res.text;
  if (!raw) throw new Error("사진 분석 결과가 비어 있습니다.");
  const parsed = JSON.parse(raw) as {
    reframe?: string;
    state_summary?: string;
  };
  return {
    reframe: (parsed.reframe ?? "").trim(),
    state_summary: (parsed.state_summary ?? "").trim(),
  };
}

// 8.5 주간 요약 — 미래의 나 1인칭, 1~2문장. 별도 1회 호출(주간 화면에서만).
export async function generateWeeklySummary(
  assetsByCategory: Record<string, string[]>,
): Promise<string> {
  const lines = Object.entries(assetsByCategory)
    .filter(([, actions]) => actions.length > 0)
    .map(([cat, actions]) => `- ${cat}: ${actions.join(", ")}`)
    .join("\n");

  const res = await withRetry(() =>
    getClient().models.generateContent({
      model: MODEL,
      contents: `이번 주 적립된 자산:\n${lines}`,
      config: {
        systemInstruction: WEEKLY_SYSTEM,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.85,
        maxOutputTokens: 300,
      },
    }),
  );

  // 혹시 모델이 별표/따옴표로 감싸면 제거 (명조 평문으로 표시).
  return (res.text ?? "")
    .trim()
    .replace(/^[*_"\s]+/, "")
    .replace(/[*_"\s]+$/, "");
}
