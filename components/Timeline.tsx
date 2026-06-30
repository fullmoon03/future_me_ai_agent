import type { AssetCategory, Domain, TimelineHorizon, WhenLabel } from "@/lib/types";
import { SceneIllustration, pickScene } from "./illustrations";

// 시점별 배경 — 시간이 미래로 갈수록 따뜻해진다 (섹션 6).
const WHEN_BG: Record<WhenLabel, string> = {
  "30분 뒤": "bg-h30",
  "오늘 밤": "bg-hnight",
  "1주 뒤": "bg-hweek",
  "1개월 뒤": "bg-hmonth",
  "3개월 뒤": "bg-h3month",
};

// 자산 카테고리 액센트 — 노드 점 색 (섹션 6).
const ASSET_DOT: Record<AssetCategory, string> = {
  체력: "bg-asset-stamina",
  집중: "bg-asset-focus",
  회복: "bg-asset-recovery",
  정리: "bg-asset-order",
  자기신뢰: "bg-coral",
};

export default function Timeline({
  cards,
  domain,
}: {
  cards: TimelineHorizon[];
  domain: Domain;
}) {
  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[92%]">
        <p className="mb-2 ml-1 font-sans text-[11px] text-subtle">
          이 작은 행동이 쌓이면 —
        </p>
        <div>
          {cards.map((card, i) => {
            const isLast = i === cards.length - 1;
            const category = pickScene(card.image_keyword, domain);
            return (
              <div key={card.when} className="flex gap-2.5">
                {/* 세로선 + 노드 점 */}
                <div className="flex flex-col items-center pt-3">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-cream ${
                      ASSET_DOT[card.asset] ?? "bg-coral"
                    }`}
                  />
                  {!isLast && <span className="w-px flex-1 bg-cardborder" />}
                </div>

                {/* 카드 */}
                <div
                  className={`mb-2.5 flex-1 rounded-2xl border border-cardborder p-2.5 ${
                    WHEN_BG[card.when] ?? "bg-h30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 장면 이미지 슬롯 — 정사각형, 라운드 */}
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-card/70">
                      <SceneIllustration
                        category={category}
                        className="h-11 w-11"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-sans text-[11px] font-medium text-subtle">
                        {card.when}
                      </div>
                      <p className="mt-0.5 font-serif text-[14px] leading-[1.6] text-warmdark">
                        {card.scene}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
