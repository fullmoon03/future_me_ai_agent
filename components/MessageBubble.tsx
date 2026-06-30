import type { ChatMessage } from "@/lib/types";

// 쪽지/편지 느낌 아이콘 (시계 아이콘 대체)
function LetterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    // 사용자 말풍선 — 고딕, 차분한 웜 뉴트럴
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[80%] flex-col items-end gap-1.5">
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

  // 미래의 나 카드 — 고딕, 부드러운 weight. 깔끔한 현대적 카드.
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-cardborder bg-card px-4 py-3.5 shadow-[0_1px_3px_rgba(47,42,37,0.04)]">
        {/* 핀 라벨 — 편지 아이콘 + "미래의 나로부터" */}
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-coral">
            <LetterIcon />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-subtle">
            미래의 나로부터
          </span>
        </div>
        <p className="whitespace-pre-line text-[15px] font-normal leading-[1.7] text-warmdark">
          {message.text}
        </p>
      </div>
    </div>
  );
}
