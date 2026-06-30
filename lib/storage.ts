// 변경 스펙: 서버 DB 없음. 대화는 브라우저 localStorage에 저장(익명).
// 섹션 7 데이터 모델을 클라이언트 저장용으로 단순화한 형태.
import type { ChatMessage } from "./types";

const MESSAGES_KEY = "future-me:messages:v1";

export function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // 저장 실패는 조용히 무시 (사생활/용량 한계 등). 데모 동작에는 영향 없음.
  }
}

export function clearMessages(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MESSAGES_KEY);
  } catch {
    // 무시
  }
}
