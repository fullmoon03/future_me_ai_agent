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
    <div className="border-t border-cardborder bg-cream px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
      {/* 저항을 떳떳한 선택지로 — 두 버튼 동등한 비중 (섹션 6) */}
      <div className="mb-2.5 grid grid-cols-2 gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPhoto(f);
            e.target.value = ""; // 같은 파일 재선택 허용
          }}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-cardborder bg-card px-3 py-2.5 font-sans text-[13px] font-medium text-coraldark disabled:opacity-50"
        >
          사진 보내기
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSend("그래도 하기 싫어")}
          className="rounded-xl border border-cardborder bg-card px-3 py-2.5 font-sans text-[13px] font-medium text-coraldark disabled:opacity-50"
        >
          그래도 하기 싫어
        </button>
      </div>

      <div className="flex items-end gap-2">
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
          placeholder="하기 싫은 일이 있어?"
          disabled={disabled}
          className="max-h-32 flex-1 resize-none rounded-2xl border border-cardborder bg-card px-4 py-2.5 font-sans text-[15px] leading-relaxed text-warmdark placeholder:text-subtle focus:border-coral focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-2xl bg-coral px-4 py-2.5 font-sans text-[15px] font-medium text-card transition-opacity disabled:opacity-40"
        >
          보내기
        </button>
      </div>
    </div>
  );
}
