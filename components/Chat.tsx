"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import Timeline from "./Timeline";
import ChatInput from "./ChatInput";
import { loadMessages, saveMessages, clearMessages } from "@/lib/storage";
import { addAsset } from "@/lib/assets";
import { prepareImage } from "@/lib/image";
import type { ChatMessage, ChatResponse, PhotoResponse } from "@/lib/types";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveMessages(messages);
  }, [messages, ready]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // 헤더의 비우기 아이콘에서 보내는 이벤트 수신
  useEffect(() => {
    const onClear = () => reset();
    window.addEventListener("future-me:clear", onClear);
    return () => window.removeEventListener("future-me:clear", onClear);
  }, []);

  async function send(text: string) {
    if (loading) return;
    setError(null);

    // 직전 사용자 메시지를 맥락으로 (Min Action/코칭 구체화). 텍스트가 있는 것만.
    const prevUser = [...messages]
      .reverse()
      .find((m) => m.role === "user" && m.text)?.text;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      kind: "coaching",
      text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context: prevUser }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "응답을 가져오지 못했어요.");
      }

      const data = (await res.json()) as ChatResponse;

      // 완료면 미래 자산으로 적립 (섹션 4.5) — 사용자가 보고한 행동을 출처로.
      if (data.asset) {
        addAsset(data.asset, text);
      }

      setMessages((prev) =>
        data.timeline
          ? [...prev, data.reply, data.timeline]
          : [...prev, data.reply],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 났어요.");
    } finally {
      setLoading(false);
    }
  }

  // 4.3 사진 기반 타임라인. 사진은 분석에만 보내고 서버에 저장하지 않는다(섹션 10.4).
  async function sendPhoto(file: File) {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const { dataUrl, base64, mimeType } = await prepareImage(file);

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        kind: "coaching",
        text: "",
        createdAt: Date.now(),
        imageDataUrl: dataUrl,
      };
      setMessages((prev) => [...prev, userMsg]);

      const res = await fetch("/api/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "사진을 해석하지 못했어요.");
      }
      const data = (await res.json()) as PhotoResponse;
      setMessages((prev) =>
        data.timeline
          ? [...prev, data.reply, data.timeline]
          : [...prev, data.reply],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "사진 처리 중 오류가 났어요.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    if (!window.confirm("이 기기에 저장된 대화를 모두 지울까요?")) return;
    clearMessages();
    setMessages([]);
    setError(null);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {ready && messages.length === 0 && (
          <div className="mt-6">
            <MessageBubble
              message={{
                id: "intro",
                role: "future_me",
                kind: "coaching",
                text: "안녕. 나는 조금 더 자란 너야.\n오늘 하기 싫은 일이 있다면 편하게 말해줘. 비난하지 않을게. 그 작은 행동이 나중에 어떤 의미가 되는지 같이 들여다보자.",
                createdAt: Date.now(),
              }}
            />
          </div>
        )}

        {messages.map((m) =>
          m.kind === "timeline" && m.cards && m.cards.length > 0 ? (
            <Timeline key={m.id} cards={m.cards} domain={m.domain ?? "기타"} />
          ) : (
            <MessageBubble key={m.id} message={m} />
          ),
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-md border border-cardborder bg-card px-4 py-3">
              <span className="inline-flex gap-1">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="px-1 text-center font-sans text-[12px] text-coraldark">
            {error}
          </div>
        )}
      </div>

      <ChatInput onSend={send} onPhoto={sendPhoto} disabled={loading} />
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-subtle"
      style={{ animationDelay: delay }}
    />
  );
}
