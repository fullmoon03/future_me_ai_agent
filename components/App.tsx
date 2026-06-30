"use client";

import { useState } from "react";
import Chat from "./Chat";
import WeeklyReport from "./WeeklyReport";

type View = "chat" | "weekly";

export default function App() {
  const [view, setView] = useState<View>("chat");

  return (
    <div className="mx-auto flex h-[100dvh] max-w-md flex-col bg-cream">
      <header className="flex items-center justify-between border-b border-cardborder px-4 py-3">
        <div>
          <h1 className="font-serif text-[17px] text-header">미래의 나</h1>
          <p className="font-sans text-[11px] text-subtle">
            미래의 내가 오늘의 나를 설득한다
          </p>
        </div>

        {/* 대화 / 이번 주 전환 */}
        <div className="flex rounded-full border border-cardborder bg-card p-0.5">
          <TabButton active={view === "chat"} onClick={() => setView("chat")}>
            대화
          </TabButton>
          <TabButton
            active={view === "weekly"}
            onClick={() => setView("weekly")}
          >
            이번 주
          </TabButton>
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
      className={`rounded-full px-3 py-1 font-sans text-[12px] font-medium transition-colors ${
        active ? "bg-coral text-card" : "text-subtle"
      }`}
    >
      {children}
    </button>
  );
}
