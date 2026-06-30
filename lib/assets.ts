// 미래 자산 적립 — 브라우저 localStorage (서버 DB 없음). 섹션 4.5 / 7.
// '누적 적립'만 다룬다. 목표 대비/달성률/연속기록은 저장하지 않는다(가드레일 2).
import type { Asset, AssetCategory } from "./types";

const ASSETS_KEY = "future-me:assets:v1";
const SUMMARY_KEY = "future-me:weekly-summary:v1"; // { [weekKey]: string }

export const ASSET_CATEGORIES: AssetCategory[] = [
  "체력",
  "집중",
  "회복",
  "정리",
  "자기신뢰",
];

// ---- ISO 주 계산 ----
export function isoWeekKey(d: Date): string {
  // 목요일 기준 ISO-8601 주차
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // 월=0 ... 일=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // 그 주의 목요일
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week =
    1 +
    Math.round(
      (date.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000),
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function currentWeekKey(): string {
  return isoWeekKey(new Date());
}

// 이번 주 월요일 0시 (로컬)
export function startOfISOWeek(d: Date): Date {
  const date = new Date(d);
  const dayNum = (date.getDay() + 6) % 7; // 월=0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - dayNum);
  return date;
}

// ---- 저장/로드 ----
export function loadAssets(): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ASSETS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Asset[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(assets: Asset[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  } catch {
    /* 무시 */
  }
}

export function addAsset(
  category: AssetCategory,
  sourceActionText: string,
): Asset {
  const now = Date.now();
  const asset: Asset = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${now}-${Math.random().toString(16).slice(2)}`,
    category,
    sourceActionText,
    weekKey: currentWeekKey(),
    createdAt: now,
  };
  const next = [...loadAssets(), asset];
  persist(next);
  return asset;
}

export function clearAssets(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ASSETS_KEY);
    window.localStorage.removeItem(SUMMARY_KEY);
  } catch {
    /* 무시 */
  }
}

// ---- 집계 (이번 주) ----
export function weekAssets(assets: Asset[], weekKey: string): Asset[] {
  return assets.filter((a) => a.weekKey === weekKey);
}

export function categoryTotals(
  assets: Asset[],
): Record<AssetCategory, number> {
  const totals = {
    체력: 0,
    집중: 0,
    회복: 0,
    정리: 0,
    자기신뢰: 0,
  } as Record<AssetCategory, number>;
  for (const a of assets) totals[a.category] += 1;
  return totals;
}

export function assetsByCategory(assets: Asset[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const a of assets) {
    (map[a.category] ??= []).push(a.sourceActionText);
  }
  return map;
}

// 이번 주 월~일 7일: 각 날 자산이 하나라도 있으면 true.
// (안 한 날은 false → UI에서 흐린 회색으로 조용히 비워둘 뿐. 비난 없음 — 가드레일 2)
export function weekDayActivity(assets: Asset[]): boolean[] {
  const monday = startOfISOWeek(new Date());
  const days: boolean[] = new Array(7).fill(false);
  for (const a of assets) {
    const diff = Math.floor(
      (a.createdAt - monday.getTime()) / (24 * 3600 * 1000),
    );
    if (diff >= 0 && diff < 7) days[diff] = true;
  }
  return days;
}

// ---- 주간 요약 캐시 (주당 1회만 LLM 호출) ----
export function getCachedSummary(weekKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SUMMARY_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[weekKey] ?? null;
  } catch {
    return null;
  }
}

export function setCachedSummary(weekKey: string, summary: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(SUMMARY_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[weekKey] = summary;
    window.localStorage.setItem(SUMMARY_KEY, JSON.stringify(map));
  } catch {
    /* 무시 */
  }
}
