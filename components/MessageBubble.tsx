import type { ChatMessage } from "@/lib/types";

// 미래의 나 카드 상단 핀 라벨에 들어갈 연도 (약 1~3년 뒤). 서버/클라 동일 계산.
const FUTURE_YEAR = new Date().getFullYear() + 1;

function ClockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    // 사용자 말풍선 — 산세리프, 따뜻한 베이지 (섹션 6). 사진이면 이미지 표시.
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[78%] flex-col items-end gap-1.5">
          {message.imageDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.imageDataUrl}
              alt="보낸 사진"
              className="max-h-56 w-auto rounded-2xl rounded-tr-md border border-cardborder object-cover"
            />
          )}
          {message.text && (
            <div className="rounded-2xl rounded-tr-md bg-userbubble px-4 py-2.5 text-[15px] leading-relaxed text-usertext">
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 미래의 나 카드 — 명조(serif). "시스템 알림이 아니라 누군가의 목소리".
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-cardborder bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(90,58,40,0.04)]">
        {/* 작은 핀 라벨 — 시계 아이콘 + "2027년의 나로부터" */}
        <div className="mb-2 flex items-center gap-1.5 text-coral">
          <ClockIcon />
          <span className="font-sans text-[11px] font-medium tracking-wide text-subtle">
            {FUTURE_YEAR}년의 나로부터
          </span>
        </div>
        <p className="whitespace-pre-line font-serif text-[16px] leading-[1.75] text-warmdark">
          {message.text}
        </p>
      </div>
    </div>
  );
}
