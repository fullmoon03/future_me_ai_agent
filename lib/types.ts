// 도메인 분류 (섹션 4.1)
export type Domain =
  | "운동"
  | "공부"
  | "수면"
  | "정리"
  | "식습관"
  | "관계"
  | "기타";

// 저항 강도 (섹션 4.1)
export type Intensity = "normal" | "high";

// 자산 카테고리 (섹션 4.5)
export type AssetCategory = "체력" | "집중" | "회복" | "정리" | "자기신뢰";

// 타임라인 시점 라벨 (섹션 4.2)
export type WhenLabel =
  | "30분 뒤"
  | "오늘 밤"
  | "1주 뒤"
  | "1개월 뒤"
  | "3개월 뒤";

// 메시지 종류 (섹션 7 data model: kind)
export type MessageKind =
  | "coaching" // 미래의 나 일반 코칭
  | "min_action" // Minimum Action Mode
  | "timeline" // 타임라인 카드 (M2)
  | "completion" // 완료 인정
  | "crisis" // 안전 분기 (섹션 10.5)
  | "stopped"; // 토큰 부족/응답 중단 (경고 카드)

export type MessageRole = "user" | "future_me" | "system";

// 분류기 출력 (섹션 8.4) + 안전 분기 신호
export interface Classification {
  domain: Domain;
  intensity: Intensity;
  is_completion: boolean;
  // 섹션 10.5 — 심각한 정서적 위기 신호. 동기부여 코칭으로 넘기지 않는다.
  is_crisis: boolean;
}

// 단일 LLM 호출의 원시 출력 (분류 + 미래의 나 메시지 + 완료 시 자산 카테고리)
export interface AgentTurn extends Classification {
  message: string;
  // is_completion === true 일 때 이 행동이 쌓는 자산 카테고리 (섹션 4.5)
  asset: AssetCategory;
}

// 적립된 미래 자산 (섹션 7 — 클라이언트 저장용). 목표 대비가 아니라 '누적 적립'.
export interface Asset {
  id: string;
  category: AssetCategory;
  sourceActionText: string;
  weekKey: string; // YYYY-Www (ISO 주)
  createdAt: number;
}

// 타임라인 카드 (섹션 4.2 / 8.2). image_keyword는 번들 SVG 매핑에만 쓰는 내부값.
export interface TimelineHorizon {
  when: WhenLabel;
  scene: string; // 생활 장면 1문장
  image_keyword: string; // 번들 일러스트 매핑용 영어 키워드 (내부)
  asset: AssetCategory; // 내부 자산 태그 (M3에서 적립)
}

export interface TimelineResult {
  horizons: TimelineHorizon[];
}

// 클라이언트에 저장/표시되는 메시지 (localStorage 구조의 단위)
export interface ChatMessage {
  id: string;
  role: MessageRole;
  kind: MessageKind;
  text: string;
  createdAt: number;
  // kind === "timeline" 일 때만 채워진다 (섹션 4.2 카드 5장)
  cards?: TimelineHorizon[];
  // 타임라인 일러스트 도메인 폴백용 (재로드 후에도 유지)
  domain?: Domain;
  // 사용자가 보낸 사진(다운스케일 dataURL). 서버 미저장, 기기에만(섹션 10.4)
  imageDataUrl?: string;
}

// /api/chat 응답
export interface ChatResponse {
  classification: Classification;
  reply: ChatMessage;
  // normal 분기에서만 동반된다. high/completion/crisis는 타임라인 없음(섹션 4.4).
  timeline?: ChatMessage;
  // completion 분기에서만. 클라이언트가 이 카테고리로 자산을 적립한다(섹션 4.5).
  asset?: AssetCategory;
}

// 주간 요약 응답 (8.5)
export interface WeeklyResponse {
  summary: string;
}

// 사진 기반 타임라인 응답 (4.3). reframe 메시지 + 타임라인.
export interface PhotoResponse {
  reply: ChatMessage; // 비난 없는 재해석(reframe)
  timeline?: ChatMessage;
}
