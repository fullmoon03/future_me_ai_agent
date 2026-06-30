import type { ChatMessage } from "@/lib/types";

// 쪽지/편지 느낌 아이콘
function LetterIcon() {
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
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    // 사용자 말풍선 — 아주 연한 라벤더
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

  // 미래의 나 카드 — 흰 배경, 라벤더 그레이 보더, 은은한 그림자, 명조 본문(편지 느낌)
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-cardborder bg-card px-4 py-3.5 shadow-[0_2px_10px_rgba(143,134,217,0.06)]">
        {/* 핀 라벨 — 연보라 원 배경의 편지 아이콘 + "2027년의 나로부터" */}
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-corallight text-coral">
            <LetterIcon />
          </span>
          <span className="font-sans text-[11px] font-medium tracking-wide text-subtle">
            미래의 나로부터
          </span>
        </div>
        <p className="whitespace-pre-line text-[15.5px] leading-[1.85] text-warmdark">
          {message.text}
        </p>
      </div>
    </div>
  );
}
