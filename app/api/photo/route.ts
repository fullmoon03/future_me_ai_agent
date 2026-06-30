import { NextRequest, NextResponse } from "next/server";
import { analyzePhoto, generateTimeline, hasGeminiKey } from "@/lib/gemini";
import type { ChatMessage, PhotoResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 10;

// 4.3 사진 기반 타임라인. 입력당 LLM 2회: ① vision 분석(reframe+state) ② 타임라인.
// 사진은 분석에만 쓰고 서버에 저장하지 않는다(섹션 10.4).
export async function POST(req: NextRequest) {
  if (!hasGeminiKey()) {
    return NextResponse.json(
      { error: "서버에 GEMINI_API_KEY가 설정되어 있지 않습니다." },
      { status: 503 },
    );
  }

  let imageBase64: string;
  let mimeType: string;
  try {
    const body = (await req.json()) as {
      imageBase64?: unknown;
      mimeType?: unknown;
    };
    imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : "";
    mimeType =
      typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json(
      { error: "사진을 읽지 못했어요." },
      { status: 400 },
    );
  }

  try {
    // ① vision 분석
    const { reframe, state_summary } = await analyzePhoto(imageBase64, mimeType);

    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      role: "future_me",
      kind: "coaching",
      text: reframe || "지금 이 모습도 너의 한 부분이야. 여기서 같이 시작해보자.",
      createdAt: Date.now(),
    };

    const payload: PhotoResponse = { reply };

    // ② 타임라인 (현재 상태를 출발점으로)
    try {
      const cards = await generateTimeline(
        state_summary || "현재 상태에서 작은 행동을 시작",
        "기타",
      );
      if (cards.length > 0) {
        payload.timeline = {
          id: crypto.randomUUID(),
          role: "future_me",
          kind: "timeline",
          text: "",
          createdAt: Date.now() + 1,
          cards,
          domain: "기타",
        };
      }
    } catch (err) {
      console.error("[/api/photo] 타임라인 실패(재해석은 유지):", err);
    }

    return NextResponse.json(payload);
  } catch (err) {
    // 일시 과부하 등으로 vision이 실패해도 따뜻하게 폴백.
    console.error("[/api/photo] 실패(폴백 응답):", err);
    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      role: "future_me",
      kind: "coaching",
      text: "사진 잘 받았어. 지금은 천천히 들여다보는 중이라 조금 뒤에 다시 보내줄래? 이 모습도 너의 한 부분이야, 괜찮아.",
      createdAt: Date.now(),
    };
    const payload: PhotoResponse = { reply };
    return NextResponse.json(payload);
  }
}
