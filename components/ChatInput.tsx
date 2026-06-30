"use client";

import { useRef, useState } from "react";

interface Props {
  onSend: (text: string) => void;
  onPhoto: (file: File) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, onPhoto, disabled }: Props) {
  const [value, setValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function submit() {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
  }

  return (
    <div className="border-t border-cardborder bg-cream px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5">
      {/* 핵심 CTA — 완료했어요(미래자산 적립) / 그래도 하기 싫어 */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSend("완료했어요")}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-coral px-3 py-2.5 font-sans text-[14px] font-semibold text-card transition-colors hover:bg-coralhover disabled:opacity-50"
        >
          <CheckIcon />
          완료했어요
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSend("그래도 하기 싫어")}
          className="rounded-xl border border-coral bg-card px-3 py-2.5 font-sans text-[14px] font-medium text-coraldark transition-colors hover:bg-corallight disabled:opacity-50"
        >
          그래도 하기 싫어
        </button>
      </div>

      {/* 입력 줄 — 카메라(보조) + 입력창 + 보내기 */}
      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPhoto(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          aria-label="사진 보내기"
          title="사진 보내기"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cardborder bg-card text-subtle transition-colors hover:text-coral disabled:opacity-50"
        >
          <CameraIcon />
        </button>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="오늘 미루고 싶은 일이 있나요?"
          disabled={disabled}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-cardborder bg-card px-4 py-2.5 font-sans text-[15px] leading-relaxed text-warmdark placeholder:text-subtle focus:border-coral focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="h-11 shrink-0 rounded-2xl bg-coral px-4 font-sans text-[15px] font-medium text-card transition-colors hover:bg-coralhover disabled:opacity-40"
        >
          보내기
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
