import type { Domain } from "@/lib/types";

// 번들 SVG 일러스트 (온디맨드 생성 없음 — 비용·지연·실패 0).
// 가드레일 1: 생활 장면만. 인물 외모/몸매 묘사 절대 없음 — 사물/환경/분위기만.
// 따뜻한 노을빛 팔레트 (섹션 6).

export type SceneCategory =
  | "desk"
  | "shoes"
  | "bed"
  | "book"
  | "meal"
  | "plant"
  | "window"
  | "path"
  | "journal"
  | "tidy"
  | "cups";

// image_keyword(영어) → 장면 카테고리 매핑
const KEYWORDS: Record<SceneCategory, string[]> = {
  desk: ["desk", "workspace", "office", "laptop", "computer"],
  shoes: ["shoe", "sneaker", "running", "run", "jog", "gym", "workout", "exercise", "sport"],
  bed: ["bed", "sleep", "pillow", "bedroom", "nap", "night rest"],
  book: ["book", "read", "page", "library", "textbook"],
  meal: ["meal", "food", "water", "kitchen", "cook", "eat", "diet", "fruit", "vegetable", "plate", "glass", "drink"],
  plant: ["plant", "calm", "cozy", "green", "grow", "leaf", "flower", "pot"],
  window: ["window", "morning", "light", "sun", "sky", "view", "dawn"],
  path: ["path", "walk", "road", "park", "outdoor", "trail", "street", "stroll", "door"],
  journal: ["journal", "record", "diary", "calendar", "habit", "log", "note", "writing", "checklist"],
  tidy: ["tidy", "clean", "organized", "order", "box", "shelf", "fold", "minimal", "declutter", "neat"],
  cups: ["cup", "mug", "tea", "coffee", "conversation", "friend", "message", "call", "together"],
};

const DOMAIN_FALLBACK: Record<Domain, SceneCategory> = {
  운동: "shoes",
  공부: "desk",
  수면: "bed",
  정리: "tidy",
  식습관: "meal",
  관계: "cups",
  기타: "plant",
};

export function pickScene(keyword: string, domain: Domain): SceneCategory {
  const k = (keyword || "").toLowerCase();
  for (const cat of Object.keys(KEYWORDS) as SceneCategory[]) {
    if (KEYWORDS[cat].some((w) => k.includes(w))) return cat;
  }
  return DOMAIN_FALLBACK[domain] ?? "plant";
}

// 색상 토큰 (illustration 내부 사용)
const C = {
  cream: "#FAF4EA",
  border: "#F0D9CE",
  coral: "#D8753F",
  amber: "#F0B254",
  dark: "#5A3A28",
  pink: "#E9A6C2",
  green: "#7FCBB0",
  violet: "#9C93E0",
};

type SVGProps = { className?: string };

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-hidden="true">
      {children}
    </svg>
  );
}

const SCENES: Record<SceneCategory, (p: SVGProps) => React.ReactElement> = {
  desk: ({ className }) => (
    <Frame className={className}>
      <rect x="10" y="40" width="44" height="4" rx="2" fill={C.dark} />
      <rect x="14" y="22" width="22" height="16" rx="2" fill={C.amber} />
      <rect x="17" y="25" width="16" height="10" rx="1" fill={C.cream} />
      <rect x="40" y="30" width="10" height="8" rx="1" fill={C.coral} />
      <circle cx="45" cy="20" r="4" fill={C.amber} />
    </Frame>
  ),
  shoes: ({ className }) => (
    <Frame className={className}>
      <rect x="10" y="46" width="44" height="4" rx="2" fill={C.border} />
      <path d="M14 46 V36 q0-4 4-4 h4 l10 8 h8 q4 0 4 4 v2 z" fill={C.coral} />
      <rect x="18" y="40" width="12" height="3" rx="1" fill={C.cream} />
      <path d="M20 16 h6 v18 h-6 z" fill={C.amber} opacity="0.5" />
    </Frame>
  ),
  bed: ({ className }) => (
    <Frame className={className}>
      <rect x="8" y="32" width="48" height="14" rx="3" fill={C.violet} opacity="0.8" />
      <rect x="12" y="28" width="16" height="8" rx="3" fill={C.cream} />
      <path d="M8 46 v6 M56 46 v6" stroke={C.dark} strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="18" r="5" fill={C.amber} />
    </Frame>
  ),
  book: ({ className }) => (
    <Frame className={className}>
      <path d="M12 20 q8-4 20 0 v26 q-12-4-20 0 z" fill={C.coral} />
      <path d="M52 20 q-8-4-20 0 v26 q12-4 20 0 z" fill={C.amber} />
      <line x1="32" y1="20" x2="32" y2="46" stroke={C.dark} strokeWidth="1.5" />
    </Frame>
  ),
  meal: ({ className }) => (
    <Frame className={className}>
      <ellipse cx="32" cy="40" rx="20" ry="6" fill={C.border} />
      <circle cx="32" cy="34" r="13" fill={C.cream} stroke={C.coral} strokeWidth="2" />
      <circle cx="32" cy="34" r="6" fill={C.green} />
      <rect x="44" y="20" width="6" height="18" rx="3" fill={C.amber} />
    </Frame>
  ),
  plant: ({ className }) => (
    <Frame className={className}>
      <path d="M24 44 h16 l-2 8 h-12 z" fill={C.coral} />
      <path d="M32 44 q-12-2-12-16 q12 2 12 16" fill={C.green} />
      <path d="M32 44 q12-4 12-20 q-12 4-12 20" fill={C.green} opacity="0.8" />
      <circle cx="32" cy="22" r="3" fill={C.pink} />
    </Frame>
  ),
  window: ({ className }) => (
    <Frame className={className}>
      <rect x="16" y="12" width="32" height="34" rx="3" fill={C.amber} opacity="0.4" stroke={C.dark} strokeWidth="2" />
      <line x1="32" y1="12" x2="32" y2="46" stroke={C.dark} strokeWidth="2" />
      <line x1="16" y1="29" x2="48" y2="29" stroke={C.dark} strokeWidth="2" />
      <circle cx="40" cy="22" r="5" fill={C.amber} />
    </Frame>
  ),
  path: ({ className }) => (
    <Frame className={className}>
      <path d="M26 50 L30 18 h4 L38 50 z" fill={C.border} />
      <line x1="32" y1="44" x2="32" y2="46" stroke={C.cream} strokeWidth="2" />
      <line x1="32" y1="34" x2="32" y2="37" stroke={C.cream} strokeWidth="2" />
      <line x1="32" y1="25" x2="32" y2="28" stroke={C.cream} strokeWidth="2" />
      <circle cx="46" cy="18" r="5" fill={C.amber} />
      <path d="M12 22 q4-4 8 0" stroke={C.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Frame>
  ),
  journal: ({ className }) => (
    <Frame className={className}>
      <rect x="16" y="14" width="32" height="38" rx="3" fill={C.cream} stroke={C.coral} strokeWidth="2" />
      <line x1="22" y1="24" x2="42" y2="24" stroke={C.dark} strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="32" x2="42" y2="32" stroke={C.border} strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="40" x2="36" y2="40" stroke={C.border} strokeWidth="2" strokeLinecap="round" />
      <circle cx="44" cy="44" r="6" fill={C.amber} />
      <path d="M41 44 l2 2 4-4" stroke={C.cream} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  ),
  tidy: ({ className }) => (
    <Frame className={className}>
      <rect x="14" y="18" width="36" height="30" rx="2" fill={C.amber} opacity="0.3" stroke={C.dark} strokeWidth="2" />
      <line x1="14" y1="33" x2="50" y2="33" stroke={C.dark} strokeWidth="2" />
      <rect x="18" y="22" width="8" height="8" rx="1" fill={C.coral} />
      <rect x="30" y="23" width="6" height="7" rx="1" fill={C.green} />
      <rect x="19" y="37" width="7" height="7" rx="1" fill={C.pink} />
      <rect x="30" y="37" width="9" height="7" rx="1" fill={C.violet} opacity="0.8" />
    </Frame>
  ),
  cups: ({ className }) => (
    <Frame className={className}>
      <path d="M14 30 h14 v8 q0 5-7 5 q-7 0-7-5 z" fill={C.coral} />
      <path d="M28 32 q5 0 5 3 q0 3-5 3" fill="none" stroke={C.coral} strokeWidth="2" />
      <path d="M36 30 h14 v8 q0 5-7 5 q-7 0-7-5 z" fill={C.amber} />
      <path d="M50 32 q5 0 5 3 q0 3-5 3" fill="none" stroke={C.amber} strokeWidth="2" />
      <path d="M20 26 q1-3 2 0 M44 26 q1-3 2 0" stroke={C.border} strokeWidth="2" fill="none" strokeLinecap="round" />
    </Frame>
  ),
};

export function SceneIllustration({
  category,
  className,
}: {
  category: SceneCategory;
  className?: string;
}) {
  const Comp = SCENES[category] ?? SCENES.plant;
  return <Comp className={className} />;
}
