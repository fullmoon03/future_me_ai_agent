import { runAgentTurn, generateTimeline } from "./gemini";
import { CRISIS_MESSAGE, STOPPED_MESSAGE } from "./prompts";
import {
  localClassify,
  localMessage,
  localTimeline,
  localAsset,
} from "./fallback";
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

// API(토큰/한도/장애)로 LLM이 안 될 때, 로컬 키워드 분류 + 준비된 콘텐츠로 응답을 구성.
// 위기·완료·강한 저항, 그리고 도메인이 잡힌 일반 코칭은 그대로 답변을 제공한다.
// 단, 도메인을 못 잡은 일반 코칭(기타)은 보여줄 적절한 답이 없으므로 '응답 중단' 경고 카드로 안내한다.
function buildLocalResult(userText: string, context?: string): AgentResult {
  const classification = localClassify(userText, context);
  const kind = deriveKind(classification);

  if (kind === "crisis") {
    return { classification, kind, text: CRISIS_MESSAGE };
  }
  if (kind === "completion") {
    return {
      classification,
      kind,
      text: localMessage(kind, classification.domain),
      asset: localAsset(classification.domain),
    };
  }
  if (kind === "min_action") {
    return { classification, kind, text: localMessage(kind, classification.domain) };
  }

  // coaching
  if (classification.domain === "기타") {
    // 적절한 폴백 답이 없는 경우 → 토큰 부족/응답 중단 경고 카드
    return { classification, kind: "stopped", text: STOPPED_MESSAGE };
  }
  return {
    classification,
    kind,
    text: localMessage(kind, classification.domain),
    timeline: localTimeline(classification.domain),
  };
}

// 입력당 LLM 최대 2회 (분류+메시지 1회, 타임라인 1회).
// 위기 신호면 메시지를 결정적 안전 응답으로 대체(섹션 10.5).
// API 실패 시에는 로컬 폴백으로 도메인별 메시지+타임라인을 그대로 제공.
export async function processInput(
  userText: string,
  context?: string,
): Promise<AgentResult> {
  let turn;
  try {
    turn = await runAgentTurn(userText, context);
  } catch (err) {
    // ① 호출 실패(429/503/네트워크 등) → 로컬 폴백
    console.error("[agent] runAgentTurn 실패 → 로컬 폴백 사용:", err);
    return buildLocalResult(userText, context);
  }

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
    // 빈 메시지면 도메인별 로컬 메시지로 보강.
    text = localMessage("coaching", classification.domain);
  }

  const result: AgentResult = { classification, kind, text };

  if (kind === "completion") {
    result.asset = turn.asset;
  }

  // 두 번째 호출 — 일반 코칭일 때만 타임라인. 실패하면 로컬 타임라인으로 대체.
  if (kind === "coaching") {
    try {
      result.timeline = await generateTimeline(userText, classification.domain);
    } catch (err) {
      console.error("[agent] 타임라인 실패 → 로컬 타임라인 사용:", err);
      result.timeline = localTimeline(classification.domain);
    }
  }

  return result;
}
