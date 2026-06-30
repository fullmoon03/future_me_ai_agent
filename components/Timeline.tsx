import type { Domain, TimelineHorizon, WhenLabel } from "@/lib/types";
import { SceneIllustration, pickScene } from "./illustrations";

// 시점별 파스텔 (타임라인 카드에만 적용 — 앱 전체는 화이트+연보라 유지).
// bg=카드 배경, border=같은 계열 연한 보더, dot=포인트 점 색, slot=배경보다 살짝 진한 아이콘 슬롯.
const HORIZON_STYLE: Record<
  WhenLabel,
  { bg: string; border: string; dot: string; slot: string }
> = {
  "30분 뒤": { bg: "#FFF4DC", border: "#F1E3C0", dot: "#E6C277", slot: "#FAE8BF" }, // 크림/아이보리 옐로우
  "오늘 밤": { bg: "#F0ECFF", border: "#E1D9F5", dot: "#A99BE6", slot: "#E3DCF9" }, // 라벤더
  "1주 뒤": { bg: "#FFF0EA", border: "#F2DCD0", dot: "#E7A88B", slot: "#FADFD2" }, // 피치/살구
  "1개월 뒤": { bg: "#EEF8F2", border: "#D6EADF", dot: "#84C7A6", slot: "#DBEFE5" }, // 민트/세이지
  "3개월 뒤": { bg: "#F8ECF6", border: "#EAD6E7", dot: "#CB95C0", slot: "#EFDBED" }, // 핑크 라벤더
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
        <p className="mb-2 ml-1 font-sans text-[12px] font-medium text-subtle">
          이 행동이 쌓이면 생기는 미래
        </p>
        <div>
          {cards.map((card, i) => {
            const isLast = i === cards.length - 1;
            const category = pickScene(card.image_keyword, domain);
            const s = HORIZON_STYLE[card.when] ?? HORIZON_STYLE["30분 뒤"];
            return (
              <div key={card.when} className="flex gap-2.5">
                {/* 세로선 + 노드 점 (점은 카드 포인트 컬러, 선은 라벤더 그레이) */}
                <div className="flex flex-col items-center pt-3.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-cream"
                    style={{ backgroundColor: s.dot }}
                  />
                  {!isLast && <span className="w-px flex-1 bg-cardborder" />}
                </div>

                {/* 카드 — 시점별 파스텔 배경 + 같은 계열 연한 보더 */}
                <div
                  className="mb-2.5 flex-1 rounded-2xl border p-2.5"
                  style={{ backgroundColor: s.bg, borderColor: s.border }}
                >
                  <div className="flex items-center gap-3">
                    {/* 장면 이미지 슬롯 — 배경보다 살짝 진한 같은 계열 */}
                    <div
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-xl"
                      style={{ backgroundColor: s.slot }}
                    >
                      <SceneIllustration
                        category={category}
                        className="h-11 w-11"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-sans text-[11px] font-medium text-subtle">
                        {card.when}
                      </div>
                      <p className="mt-0.5 text-[14px] leading-[1.6] text-warmdark">
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
