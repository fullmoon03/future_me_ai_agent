import type { ChatMessage } from "@/lib/types";

// 경고 아이콘 — 투명 배경, 빨간 원형 outline, 안에 빨간 느낌표
function WarningIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D9534F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.5" />
      <circle cx="12" cy="16.2" r="0.6" fill="#D9534F" stroke="none" />
    </svg>
  );
}

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

  // 토큰 부족/응답 중단 — 경고 상태 행 + 재시도 본문. 카드 전체를 빨갛게 하지 않고
  // border만 아주 연한 붉은 회색으로 구분 (화이트+연보라 톤과 자연스럽게).
  if (message.kind === "stopped") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-[#E9D6D6] bg-card px-4 py-3.5 shadow-[0_2px_10px_rgba(217,83,79,0.05)]">
          {/* 상단 경고 상태 행 — 작고 보조적인 기술 정보 (sans) */}
          <div className="mb-2 flex items-center gap-1.5">
            <WarningIcon />
            <span className="font-sans text-[11px] font-medium tracking-wide text-[#B66B68]">
              Response stopped: token limit reached
            </span>
          </div>
          {/* 본문 — 기존 명조 톤 유지 */}
          <p className="whitespace-pre-line text-[15.5px] leading-[1.85] text-warmdark">
            {message.text}
          </p>
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
