// API(토큰/한도/장애)로 LLM이 호출되지 않을 때를 대비한 로컬 폴백.
// 키워드로 도메인을 분류하고, 미리 준비된 미래의 나 메시지 + 타임라인을 돌려준다.
// 모든 콘텐츠는 가드레일(섹션 10) 준수: 외모/수치 없음, 비난 없음, 정체성·증거 중심,
// 타임라인은 생활 장면만(번들 SVG로 매핑되는 image_keyword 사용).
import type {
  AssetCategory,
  Classification,
  Domain,
  MessageKind,
  TimelineHorizon,
} from "./types";

// ---- 로컬 분류 (키워드 기반, API 불필요) ----
const CRISIS_KW = [
  "사라지고 싶",
  "살기 싫",
  "죽고 싶",
  "다 끝내고 싶",
  "자해",
  "없어지고 싶",
];
const COMPLETION_KW = [
  "했어",
  "했다",
  "왔어",
  "다녀왔",
  "끝냈",
  "끝났",
  "완료",
  "마쳤",
  "해냈",
];
const HIGH_KW = [
  "그래도",
  "못 하겠",
  "못하겠",
  "진짜 무리",
  "너무 귀찮",
  "도저히",
  "포기",
  "하기 싫어 죽",
];

const DOMAIN_KW: Record<Exclude<Domain, "기타">, string[]> = {
  운동: ["운동", "헬스", "러닝", "달리기", "걷기", "산책", "요가", "스트레칭", "짐", "조깅"],
  공부: ["공부", "시험", "과제", "숙제", "학습", "강의", "독서", "책 읽", "복습", "코딩 공부"],
  수면: ["잠", "자기", "일찍 자", "수면", "잘 시간", "밤샘", "자야", "취침"],
  정리: ["정리", "청소", "치우", "설거지", "빨래", "방 정리", "책상 정리", "정돈"],
  식습관: ["밥", "먹", "식단", "식사", "끼니", "야식", "다이어트", "물 마시", "물 한 잔"],
  관계: ["연락", "친구", "가족", "만나", "약속", "관계", "전화", "안부", "톡"],
};

function detectDomain(text: string): Domain {
  for (const domain of Object.keys(DOMAIN_KW) as Exclude<Domain, "기타">[]) {
    if (DOMAIN_KW[domain].some((kw) => text.includes(kw))) return domain;
  }
  return "기타";
}

export function localClassify(text: string, context?: string): Classification {
  const combined = `${text} ${context ?? ""}`;
  const is_crisis = CRISIS_KW.some((kw) => text.includes(kw));
  const is_completion =
    !is_crisis && COMPLETION_KW.some((kw) => text.includes(kw));
  const intensity =
    !is_crisis && !is_completion && HIGH_KW.some((kw) => text.includes(kw))
      ? "high"
      : "normal";
  return {
    domain: detectDomain(combined),
    intensity,
    is_completion,
    is_crisis,
  };
}

// ---- 도메인 → 자산 카테고리 ----
const DOMAIN_ASSET: Record<Domain, AssetCategory> = {
  운동: "체력",
  공부: "집중",
  수면: "회복",
  정리: "정리",
  식습관: "체력",
  관계: "자기신뢰",
  기타: "자기신뢰",
};

export function localAsset(domain: Domain): AssetCategory {
  return DOMAIN_ASSET[domain];
}

// ---- 도메인별 미래의 나 메시지 ----
const COACHING: Record<Domain, string> = {
  운동:
    "오늘 운동 가기 싫은 거 알아. 그 마음 그대로 둬도 괜찮아. 오늘의 운동은 몸을 바꾸는 게 아니라 '나는 나를 포기하지 않는다'는 증거를 하나 남기는 일이야. 운동복만 입고 현관까지 가보는 것부터, 나는 거기서 시작했어.",
  공부:
    "오늘 공부하기 싫은 마음, 충분히 이해해. 억지로 다 하려고 하지 않아도 돼. 오늘 펼친 한 페이지는 성적이 아니라 '나는 다시 책상에 앉을 수 있는 사람'이라는 증거가 돼. 그 작은 증거들이 모여 지금의 내가 됐어.",
  수면:
    "일찍 자기 싫은 밤이 있다는 거, 나도 알아. 오늘 조금 일찍 눈을 감는 건 부지런함의 문제가 아니라 '나는 나를 회복시킬 줄 아는 사람'이라는 증거야. 화면을 잠깐 멀리 두는 것만으로 충분해. 푹 쉰 아침은 생각보다 큰 선물이 되더라.",
  정리:
    "어질러진 공간을 보면 손대기 싫은 거 알아. 한 번에 다 치우지 않아도 돼. 물건 몇 개를 제자리에 두는 건 '나는 내 공간을 돌볼 수 있는 사람'이라는 증거가 돼. 정돈된 자리는 마음의 여백으로 돌아오더라.",
  식습관:
    "오늘 잘 챙겨 먹는 게 귀찮은 거 알아. 완벽하게 안 해도 괜찮아. 물 한 잔, 한 끼를 천천히 챙기는 건 '나는 나를 돌볼 수 있는 사람'이라는 증거야. 그 작은 챙김이 쌓여 가벼운 날들을 만들어.",
  관계:
    "먼저 연락하는 게 어색하고 망설여지는 마음, 나도 알아. 거창한 말이 아니어도 돼. 짧은 안부 한 마디는 '나는 사람과 이어질 수 있는 사람'이라는 증거가 돼. 그 작은 연결들이 모여 나를 든든하게 했어.",
  기타:
    "지금 그 일이 하기 싫은 마음, 그대로 받아들일게. 크게 하려고 하지 않아도 돼. 아주 작은 한 걸음은 '나는 시작할 수 있는 사람'이라는 증거가 돼. 그 증거들이 쌓여 지금의 내가 됐어.",
};

const MIN_ACTION: Record<Domain, string> = {
  운동:
    "좋아, 오늘 운동은 버리자. 운동복만 입고 현관까지만 가보자. 나가서도 싫으면 10분만 걷고 와도 충분해.",
  공부:
    "좋아, 오늘 공부 다 하려는 건 버리자. 책 딱 한 페이지만 펼쳐두자. 한 줄만 읽어도 오늘은 그걸로 충분해.",
  수면:
    "좋아, 일찍 자야 한다는 부담은 내려놓자. 그냥 불만 한 단계 낮추고 화면을 멀리 둬보자. 그것만으로 충분해.",
  정리:
    "좋아, 다 치우려는 마음은 버리자. 눈앞의 물건 딱 하나만 제자리에 두자. 거기서 멈춰도 괜찮아.",
  식습관:
    "좋아, 잘 챙겨 먹어야 한다는 부담은 내려놓자. 그냥 물 한 잔만 채워 옆에 두자. 그거면 오늘은 충분해.",
  관계:
    "좋아, 길게 말 걸어야 한다는 부담은 버리자. 그냥 '잘 지내?' 한 마디만 떠올려두자. 떠올린 것만으로도 시작이야.",
  기타:
    "좋아, 오늘 다 하려는 건 버리자. 딱 하나, 제일 작은 한 걸음만 정하자. 거기까지만 해도 충분해.",
};

const COMPLETION: Record<Domain, string> = {
  운동:
    "오늘 너는 '나는 나를 움직이게 할 수 있는 사람'이라는 증거를 하나 남겼어. 그 한 걸음이 지금의 나를 만들었어.",
  공부:
    "오늘 너는 '나는 다시 앉을 수 있는 사람'이라는 증거를 하나 남겼어. 그 한 페이지가 쌓여 지금이 됐어.",
  수면:
    "오늘 너는 '나는 나를 회복시킬 줄 아는 사람'이라는 증거를 남겼어. 푹 쉰 너에게 고마워.",
  정리:
    "오늘 너는 '나는 내 공간을 돌볼 수 있는 사람'이라는 증거를 남겼어. 그 작은 정돈이 마음의 여백이 돼.",
  식습관:
    "오늘 너는 '나는 나를 챙길 수 있는 사람'이라는 증거를 남겼어. 그 한 끼가 너를 지켜.",
  관계:
    "오늘 너는 '나는 먼저 다가갈 수 있는 사람'이라는 증거를 남겼어. 그 한 마디가 관계를 데웠어.",
  기타:
    "오늘 너는 '나는 시작할 수 있는 사람'이라는 증거를 하나 남겼어. 작게 시작한 게 가장 큰 일이야.",
};

export function localMessage(kind: MessageKind, domain: Domain): string {
  if (kind === "min_action") return MIN_ACTION[domain];
  if (kind === "completion") return COMPLETION[domain];
  return COACHING[domain];
}

// ---- 도메인별 타임라인 5장 (생활 장면, image_keyword는 번들 SVG로 매핑) ----
const TIMELINES: Record<Domain, TimelineHorizon[]> = {
  운동: [
    { when: "30분 뒤", scene: "운동복으로 갈아입고 현관 앞에 선다. 일단 신발끈을 묶었다.", image_keyword: "running shoes by the door", asset: "체력" },
    { when: "오늘 밤", scene: "가볍게 몸을 움직이고 돌아와, 개운한 마음으로 하루를 닫는다.", image_keyword: "calm bedroom at night", asset: "회복" },
    { when: "1주 뒤", scene: "현관에 둔 운동화가 익숙해지고, 나가는 일이 조금 덜 무겁다.", image_keyword: "running shoes by the door", asset: "체력" },
    { when: "1개월 뒤", scene: "산책로를 걷는 게 하루의 자연스러운 일부가 되었다.", image_keyword: "walking path in park", asset: "체력" },
    { when: "3개월 뒤", scene: "몸을 움직이는 일이 나를 돌보는 방식으로 자리 잡았다.", image_keyword: "open window morning light", asset: "자기신뢰" },
  ],
  공부: [
    { when: "30분 뒤", scene: "책상에 앉아 책을 펼치고, 딱 한 페이지를 읽기 시작한다.", image_keyword: "open book on table", asset: "집중" },
    { when: "오늘 밤", scene: "오늘 본 내용이 적힌 노트를 덮으며 잠자리에 든다.", image_keyword: "study notes at night", asset: "회복" },
    { when: "1주 뒤", scene: "책상 위에 일주일치 학습 흔적이 차곡차곡 쌓였다.", image_keyword: "tidy desk with books", asset: "정리" },
    { when: "1개월 뒤", scene: "정리된 자료를 보며 다음 단계로 넘어갈 준비를 한다.", image_keyword: "organized study desk", asset: "자기신뢰" },
    { when: "3개월 뒤", scene: "공부가 자연스러운 일상이 되어 편안하게 새로운 걸 탐구한다.", image_keyword: "calm study space with plants", asset: "집중" },
  ],
  수면: [
    { when: "30분 뒤", scene: "화면을 멀리 두고, 방의 불을 한 단계 낮춘다.", image_keyword: "calm bedroom at night", asset: "회복" },
    { when: "오늘 밤", scene: "조금 일찍 누워 천천히 호흡을 고른다.", image_keyword: "cozy bed and pillow", asset: "회복" },
    { when: "1주 뒤", scene: "잠드는 시간이 일정해지며 아침이 덜 무겁다.", image_keyword: "morning light through window", asset: "회복" },
    { when: "1개월 뒤", scene: "충분히 쉰 몸으로 하루를 시작하는 게 익숙해졌다.", image_keyword: "open window morning", asset: "자기신뢰" },
    { when: "3개월 뒤", scene: "회복이 나를 지키는 습관으로 자리 잡았다.", image_keyword: "calm cozy room with plant", asset: "회복" },
  ],
  정리: [
    { when: "30분 뒤", scene: "책상 위 물건 몇 개를 제자리에 둔다.", image_keyword: "tidy desk", asset: "정리" },
    { when: "오늘 밤", scene: "정돈된 공간에서 한결 가벼운 마음으로 하루를 닫는다.", image_keyword: "organized clean room", asset: "정리" },
    { when: "1주 뒤", scene: "자주 쓰는 것들이 제자리를 찾아 손이 편해졌다.", image_keyword: "organized shelf", asset: "정리" },
    { when: "1개월 뒤", scene: "공간이 정돈되니 마음의 여백도 늘었다.", image_keyword: "calm tidy room with plant", asset: "회복" },
    { when: "3개월 뒤", scene: "정리가 특별한 일이 아니라 자연스러운 리듬이 되었다.", image_keyword: "minimal tidy desk", asset: "자기신뢰" },
  ],
  식습관: [
    { when: "30분 뒤", scene: "물 한 잔을 채워 옆에 두고, 한 끼를 천천히 챙긴다.", image_keyword: "glass of water in kitchen", asset: "체력" },
    { when: "오늘 밤", scene: "속이 편한 하루였다는 감각으로 잠자리에 든다.", image_keyword: "calm bedroom at night", asset: "회복" },
    { when: "1주 뒤", scene: "냉장고와 식탁이 조금 더 단정해졌다.", image_keyword: "tidy kitchen table", asset: "정리" },
    { when: "1개월 뒤", scene: "몸이 가벼운 날이 늘고, 끼니가 나를 돌보는 일이 되었다.", image_keyword: "healthy meal plate", asset: "체력" },
    { when: "3개월 뒤", scene: "잘 먹는 일이 애쓰지 않아도 되는 습관이 되었다.", image_keyword: "kitchen morning light", asset: "자기신뢰" },
  ],
  관계: [
    { when: "30분 뒤", scene: "짧은 안부 한 마디를 떠올리고, 먼저 건넨다.", image_keyword: "two mugs tea conversation", asset: "자기신뢰" },
    { when: "오늘 밤", scene: "연결된 느낌으로 하루를 따뜻하게 닫는다.", image_keyword: "two warm cups", asset: "회복" },
    { when: "1주 뒤", scene: "작은 연락들이 쌓여 관계가 조금 가까워졌다.", image_keyword: "cups together message", asset: "자기신뢰" },
    { when: "1개월 뒤", scene: "먼저 다가가는 일이 덜 어색해졌다.", image_keyword: "open window light", asset: "자기신뢰" },
    { when: "3개월 뒤", scene: "사람과 이어지는 일이 나를 채우는 방식이 되었다.", image_keyword: "cozy room with two cups", asset: "회복" },
  ],
  기타: [
    { when: "30분 뒤", scene: "아주 작은 한 걸음을 정해 지금 시작한다.", image_keyword: "open window morning light", asset: "자기신뢰" },
    { when: "오늘 밤", scene: "오늘 한 작은 행동을 떠올리며 하루를 닫는다.", image_keyword: "notebook with records", asset: "자기신뢰" },
    { when: "1주 뒤", scene: "작은 시도들이 기록처럼 쌓이기 시작했다.", image_keyword: "notebook with records", asset: "자기신뢰" },
    { when: "1개월 뒤", scene: "'나는 시작할 수 있는 사람'이라는 감각이 또렷해졌다.", image_keyword: "tidy desk plan", asset: "자기신뢰" },
    { when: "3개월 뒤", scene: "작게 시작하는 일이 나의 기본값이 되었다.", image_keyword: "calm room with plant", asset: "자기신뢰" },
  ],
};

export function localTimeline(domain: Domain): TimelineHorizon[] {
  return TIMELINES[domain];
}
