import { NextRequest, NextResponse } from "next/server";
import { generateWeeklySummary, hasGeminiKey } from "@/lib/gemini";
import type { WeeklyResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 10;

// 8.5 주간 요약. 입력: 이번 주 카테고리별 행동 텍스트. 출력: 미래의 나 1~2문장.
export async function POST(req: NextRequest) {
  if (!hasGeminiKey()) {
    return NextResponse.json(
      { error: "서버에 GEMINI_API_KEY가 설정되어 있지 않습니다." },
      { status: 503 },
    );
  }

  let assetsByCategory: Record<string, string[]>;
  try {
    const body = (await req.json()) as {
      assetsByCategory?: Record<string, string[]>;
    };
    assetsByCategory = body.assetsByCategory ?? {};
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const total = Object.values(assetsByCategory).reduce(
    (n, a) => n + (Array.isArray(a) ? a.length : 0),
    0,
  );
  if (total === 0) {
    return NextResponse.json(
      { error: "이번 주 적립된 자산이 없습니다." },
      { status: 400 },
    );
  }

  try {
    const summary = await generateWeeklySummary(assetsByCategory);
    const payload: WeeklyResponse = { summary };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/weekly] 실패:", err);
    return NextResponse.json(
      { error: "요약을 만들지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
