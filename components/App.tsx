"use client";

import { useState } from "react";
import Chat from "./Chat";
import WeeklyReport from "./WeeklyReport";

type View = "chat" | "weekly";

export default function App() {
  const [view, setView] = useState<View>("chat");

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-cream">
      <header className="flex items-center justify-between gap-2 border-b border-cardborder px-4 py-3">
        <h1 className="text-[16px] font-bold tracking-tight text-header">
          미래의 나
        </h1>

        <div className="flex items-center gap-2">
          {/* 오늘의 나 / 미래자산 전환 */}
          <div className="flex rounded-full border border-cardborder bg-card p-0.5">
            <TabButton active={view === "chat"} onClick={() => setView("chat")}>
              오늘의 나
            </TabButton>
            <TabButton
              active={view === "weekly"}
              onClick={() => setView("weekly")}
            >
              미래자산
            </TabButton>
          </div>

          {/* 대화 비우기 — 보조 기능, 작은 아이콘 */}
          {view === "chat" && (
            <button
              type="button"
              aria-label="대화 비우기"
              title="대화 비우기"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("future-me:clear"))
              }
              className="grid h-8 w-8 place-items-center rounded-full text-subtle hover:bg-card"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      </header>

      {view === "chat" ? <Chat /> : <WeeklyReport />}
    </div>
  );
}

function TabButton({
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
      className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
        active ? "bg-coral text-card" : "text-subtle"
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
