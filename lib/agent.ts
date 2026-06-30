import { runAgentTurn, generateTimeline } from "./gemini";
import { CRISIS_MESSAGE } from "./prompts";
import type {
  AssetCategory,
  Classification,
  MessageKind,
  TimelineHorizon,
} from "./types";

// 분류 결과 → 메시지 kind 유도 (섹션 5 에이전트 흐름).
// 우선순위: 위기 > 완료 > 강한 저항 > 일반 코칭.
export function deriveKind(c: Classification): MessageKind {
  if (c.is_crisis) return "crisis";
  if (c.is_completion) return "completion";
  if (c.intensity === "high") return "min_action";
  return "coaching";
}

export interface AgentResult {
  classification: Classification;
  kind: MessageKind;
  text: string;
  // normal(coaching) 분기에서만 채워진다 (섹션 4.4: high/완료/위기는 타임라인 없음).
  timeline?: TimelineHorizon[];
  // completion 분기에서만. 적립할 자산 카테고리 (섹션 4.5).
  asset?: AssetCategory;
}

// 입력당 LLM 최대 2회 (분류+메시지 1회, 타임라인 1회).
// 위기 신호면 메시지를 결정적 안전 응답으로 대체(섹션 10.5).
export async function processInput(
  userText: string,
  context?: string,
): Promise<AgentResult> {
  const turn = await runAgentTurn(userText, context);
  const classification: Classification = {
    domain: turn.domain,
    intensity: turn.intensity,
    is_completion: turn.is_completion,
    is_crisis: turn.is_crisis,
  };
  const kind = deriveKind(classification);

  let text: string;
  if (kind === "crisis") {
    text = CRISIS_MESSAGE;
  } else if (turn.message) {
    text = turn.message;
  } else {
    text = "오늘 그 마음, 그대로 받아들일게. 아주 작은 한 걸음만 같이 떠올려보자.";
  }

  const result: AgentResult = { classification, kind, text };

  // 완료 분기면 적립할 자산 카테고리를 전달 (추가 호출 없음 — ①호출에서 받음).
  if (kind === "completion") {
    result.asset = turn.asset;
  }

  // 두 번째 호출 — 일반 코칭일 때만 타임라인. 실패해도 코칭은 살린다.
  if (kind === "coaching") {
    try {
      result.timeline = await generateTimeline(userText, classification.domain);
    } catch (err) {
      console.error("[agent] 타임라인 생성 실패(코칭은 유지):", err);
    }
  }

  return result;
}
