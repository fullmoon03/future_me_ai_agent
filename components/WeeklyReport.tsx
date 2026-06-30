"use client";

import { useEffect, useState } from "react";
import {
  loadAssets,
  weekAssets,
  categoryTotals,
  assetsByCategory,
  weekDayActivity,
  currentWeekKey,
  startOfISOWeek,
  getCachedSummary,
  setCachedSummary,
  ASSET_CATEGORIES,
} from "@/lib/assets";
import type { Asset, AssetCategory, WeeklyResponse } from "@/lib/types";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

// 자산 카테고리 액센트 (섹션 6)
const ASSET_COLOR: Record<AssetCategory, string> = {
  체력: "bg-asset-stamina",
  집중: "bg-asset-focus",
  회복: "bg-asset-recovery",
  정리: "bg-asset-order",
  자기신뢰: "bg-coral",
};

function weekRangeLabel(): string {
  const monday = startOfISOWeek(new Date());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const f = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;
  return `${f(monday)} – ${f(sunday)}`;
}

export default function WeeklyReport() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [ready, setReady] = useState(false);

  const weekKey = currentWeekKey();

  useEffect(() => {
    const all = loadAssets();
    const wk = weekAssets(all, weekKey);
    setAssets(wk);
    setSummary(getCachedSummary(weekKey));
    setReady(true);
  }, [weekKey]);

  async function fetchSummary(force = false) {
    if (loadingSummary) return;
    if (assets.length === 0) return;
    if (!force && getCachedSummary(weekKey)) return;

    setLoadingSummary(true);
    try {
      const res = await fetch("/api/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetsByCategory: assetsByCategory(assets) }),
      });
      if (res.ok) {
        const data = (await res.json()) as WeeklyResponse;
        setSummary(data.summary);
        setCachedSummary(weekKey, data.summary);
      }
    } finally {
      setLoadingSummary(false);
    }
  }

  // 자산이 있고 요약이 아직 없으면 1회 자동 생성
  useEffect(() => {
    if (ready && assets.length > 0 && !summary && !loadingSummary) {
      void fetchSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, assets.length]);

  const totals = categoryTotals(assets);
  const dots = weekDayActivity(assets);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const activeCategories = ASSET_CATEGORIES.filter((c) => totals[c] > 0);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <div className="mb-1 font-sans text-[12px] text-subtle">
        {weekRangeLabel()}
      </div>
      <h2 className="mb-6 font-serif text-[20px] text-header">이번 주의 나</h2>

      {/* 한 주의 흐름 — 점 7개. 안 한 날은 흐린 회색으로 조용히 (비난 없음) */}
      <div className="mb-7">
        <div className="flex justify-between">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1.5">
              <span
                className={`h-6 w-6 rounded-full ${
                  dots[i] ? "bg-coral" : "bg-cardborder/50"
                } ${i === todayIdx ? "ring-2 ring-coral/40 ring-offset-2 ring-offset-cream" : ""}`}
              />
              <span className="font-sans text-[11px] text-subtle">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {ready && assets.length === 0 ? (
        // 빈 상태 — 죄책감 없이 부드럽게
        <div className="mt-10 rounded-2xl border border-cardborder bg-card px-5 py-6">
          <p className="font-serif text-[15px] leading-[1.8] text-warmdark">
            이번 주엔 아직 쌓인 게 없네. 괜찮아.
            <br />
            아주 작은 행동 하나면 충분해 — 그걸 해내고 &ldquo;했어&rdquo;라고 말해줘.
          </p>
        </div>
      ) : (
        <>
          {/* 쌓인 미래 자산 — 누적값(달성률 아님) */}
          <div className="mb-7">
            <h3 className="mb-3 font-sans text-[13px] font-medium text-header">
              쌓인 미래 자산
            </h3>
            <div className="space-y-2.5">
              {activeCategories.map((c) => (
                <div key={c} className="flex items-center gap-2.5">
                  <span className={`h-3 w-3 rounded-full ${ASSET_COLOR[c]}`} />
                  <span className="font-sans text-[14px] text-warmdark">
                    {c}
                  </span>
                  <span className="ml-auto font-sans text-[13px] text-subtle">
                    {"·".repeat(Math.min(totals[c], 8))}{" "}
                    {totals[c] > 8 ? `${totals[c]}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 미래의 나의 "이번 주 핵심 변화" (8.5) — 명조 */}
          <div className="rounded-2xl border border-cardborder bg-card px-4 py-4">
            <div className="mb-2 font-sans text-[11px] font-medium text-subtle">
              이번 주 핵심 변화
            </div>
            {loadingSummary && !summary ? (
              <p className="font-sans text-[13px] text-subtle">
                미래의 내가 이번 주를 돌아보는 중…
              </p>
            ) : summary ? (
              <p className="whitespace-pre-line font-serif text-[16px] leading-[1.75] text-warmdark">
                {summary}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => fetchSummary(true)}
                className="font-sans text-[13px] text-coraldark underline-offset-2 hover:underline"
              >
                이번 주 돌아보기
              </button>
            )}
            {summary && (
              <button
                type="button"
                onClick={() => fetchSummary(true)}
                disabled={loadingSummary}
                className="mt-3 font-sans text-[12px] text-subtle underline-offset-2 hover:underline disabled:opacity-50"
              >
                다시 돌아보기
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
