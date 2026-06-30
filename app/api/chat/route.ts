import { NextRequest, NextResponse } from "next/server";
import { processInput } from "@/lib/agent";
import { hasGeminiKey } from "@/lib/gemini";
import type { ChatMessage, ChatResponse } from "@/lib/types";

export const runtime = "nodejs";
// Vercel Hobby 함수 한도. 입력당 LLM 1회로 충분히 이내에 끝난다.
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  if (!hasGeminiKey()) {
    return NextResponse.json(
      {
        error:
          "서버에 GEMINI_API_KEY가 설정되어 있지 않습니다. Vercel 환경변수에 추가해 주세요.",
      },
      { status: 503 },
    );
  }

  let text: string;
  let context: string | undefined;
  try {
    const body = (await req.json()) as { text?: unknown; context?: unknown };
    text = typeof body.text === "string" ? body.text.trim() : "";
    context =
      typeof body.context === "string" && body.context.trim()
        ? body.context.trim().slice(0, 300)
        : undefined;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json(
      { error: "메시지를 입력해 주세요." },
      { status: 400 },
    );
  }
  if (text.length > 1000) {
    text = text.slice(0, 1000);
  }

  try {
    const result = await processInput(text, context);
    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      role: "future_me",
      kind: result.kind,
      text: result.text,
      createdAt: Date.now(),
    };
    const payload: ChatResponse = {
      classification: result.classification,
      reply,
    };
    // 완료면 적립할 자산 카테고리를 클라이언트에 전달 (섹션 4.5)
    if (result.asset) {
      payload.asset = result.asset;
    }
    // 타임라인이 있으면 별도 메시지로 동반 (섹션 4.2)
    if (result.timeline && result.timeline.length > 0) {
      payload.timeline = {
        id: crypto.randomUUID(),
        role: "future_me",
        kind: "timeline",
        text: "",
        createdAt: Date.now() + 1,
        cards: result.timeline,
        domain: result.classification.domain,
      };
    }
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/chat] 처리 실패:", err);
    return NextResponse.json(
      { error: "지금은 응답을 만들지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
