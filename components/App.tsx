"use client";

import { useState } from "react";
import Chat from "./Chat";
import WeeklyReport from "./WeeklyReport";

type View = "chat" | "weekly";

export default function App() {
  const [view, setView] = useState<View>("chat");

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-cream">
      {/* 헤더 — 편지/저널 감성 */}
      <header className="flex items-start justify-between px-5 pb-2 pt-4">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-header">
            Future Me
          </h1>
          <p className="mt-0.5 font-sans text-[11px] text-subtle">
            미래의 내가 오늘의 나를 설득하다
          </p>
        </div>
        {view === "chat" && (
          <button
            type="button"
            aria-label="대화 비우기"
            title="대화 비우기"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("future-me:clear"))
            }
            className="-mr-1 grid h-8 w-8 place-items-center rounded-full text-subtle transition-colors hover:bg-corallight hover:text-coral"
          >
            <TrashIcon />
          </button>
        )}
      </header>

      {/* 탭 — 연보라 언더라인 */}
      <nav className="flex gap-5 border-b border-cardborder px-5">
        <Tab active={view === "chat"} onClick={() => setView("chat")}>
          오늘의 나
        </Tab>
        <Tab active={view === "weekly"} onClick={() => setView("weekly")}>
          미래자산
        </Tab>
      </nav>

      {view === "chat" ? <Chat /> : <WeeklyReport />}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 pb-2.5 pt-1 font-sans text-[14px] transition-colors ${
        active
          ? "border-coral font-medium text-header"
          : "border-transparent text-subtle"
      }`}
    >
      {children}
    </button>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a1 1 0 01-1 1H6a1 1 0 01-1-1V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
