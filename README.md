# 미래의 나 (Future Me Agent)

> 미래의 내가 오늘의 나를 설득한다.

하기 싫은 일에 대한 저항감을 입력하면, **미래의 나** 페르소나가 오늘의 작은 행동을
장기적 의미·정체성으로 따뜻하게 재해석해 주는 개인 성장 AI 에이전트.
코치처럼 압박하지 않고, 안 한 날을 비난하지 않으며, 외모/몸매를 다루지 않는다.

## 스택 (학교 과제 / 비용 0원 제약)

- **Next.js (App Router) + TypeScript** — 프론트 + serverless API route
- **Google Gemini 2.5 Flash (무료 티어)** — 분류·코칭 (서버 route에서만 호출)
- **저장: 브라우저 localStorage** — 서버 DB 없음, 인증 없음(익명). 잠들 서비스 0
- **Tailwind CSS v4** — 섹션 6 노을빛 팔레트를 테마 토큰으로 등록
- **배포: Vercel Hobby(무료)**

### 비용·무휴면 설계

- 서버 DB 없음 → 일시정지로 데모가 죽지 않음
- 입력당 LLM **1회 호출**(분류+메시지 한 JSON) → Vercel Hobby 10초 한도 이내
- 이미지 온디맨드 생성 없음(이후 번들 SVG 매핑)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # GEMINI_API_KEY 채우기
npm run dev                  # http://localhost:3000
```

Gemini 키 발급: https://aistudio.google.com/apikey (무료)

## Vercel 배포 (무료, 무휴면)

1. 코드를 GitHub 저장소에 푸시
   ```bash
   git init && git add -A && git commit -m "future-me-agent M1~M5"
   # GitHub에 새 repo 만든 뒤
   git remote add origin <your-repo-url> && git push -u origin main
   ```
2. https://vercel.com → **Add New → Project** → 위 GitHub repo Import (프레임워크 자동 인식: Next.js)
3. **Settings → Environment Variables**에 `GEMINI_API_KEY` = 발급한 키 추가 (Production)
4. **Deploy** → `https://<프로젝트>.vercel.app` 공개 URL 생성. 교수님이 며칠 뒤 열어도 동작(서버 DB 없음 → 잠들지 않음).

함수 타임아웃은 Hobby 기본 10초이며, 입력당 LLM 호출을 최대 2회로 묶어 이내에 끝나도록 설계했다.

## 개인정보 / 안전

- **사진**: 분석 목적으로만 서버(API route)로 전송하며 **저장하지 않는다**. 화면 표시는 기기 내 다운스케일 이미지로만(섹션 10.4). "대화 비우기"로 즉시 삭제.
- **대화·자산**: 전부 브라우저 localStorage(기기 내). 서버·계정 없음.
- ⚠️ 무료 Gemini는 입력을 학습에 사용할 수 있다. 데모는 **더미 문장/이미지**로 시연한다.
- **정서적 위기** 감지 시 코칭을 멈추고 상담번호 안내로 전환(섹션 10.5).

## 현재 진행 (마일스톤)

- [x] **M1 — 대화 + 페르소나(텍스트).** 입력 → 분류기 분기 → 미래의 나 응답.
      localStorage 저장, 디자인 시스템(서체 대비) 적용, 안전 분기(섹션 10.5) 포함.
- [x] **M2 — 타임라인 카드 5장.** normal 분기에서만 2번째 호출(8.2 JSON) → 세로선+노드+카드,
      시점별 배경색 변화, 번들 SVG 일러스트 매핑(생성 0). high/완료/위기는 카드 없음.
- [x] **M3 — 자산 적립 + 주간 리포트.** 완료 감지 시 ①호출이 함께 산출한 asset 카테고리로
      localStorage 누적(추가 호출 0). 주간 화면: 점 7개(안 한 날은 흐린 회색·비난 0),
      카테고리별 누적, 미래의 나 "이번 주 핵심 변화"(8.5, 주당 1회 캐시). 달성률·streak·막대 없음.
- [x] **M4 — 사진 기반 타임라인.** 사진 업로드(클라이언트 다운스케일) → Gemini vision 분석
      (8.3 비난 없는 재해석 + 상태 요약) → 그 상태에서 타임라인. 사진은 분석에만 쓰고 서버 미저장(섹션 10.4).
- [x] **M5 — Min Action 다듬기 + 이미지 전략 확정 + PWA.** 직전 메시지를 맥락으로 넘겨
      Min Action을 구체화. 이미지 전략은 **번들 SVG 매핑(A안) 확정**(생성 0). PWA: 아이콘·매니페스트·
      서비스워커(앱 셸 캐시, /api 미캐시)로 홈 화면 추가 지원. 배포는 아래 절차. 마감

## 가드레일 (타협 불가 — 섹션 10)

이미지 안전 / 압박 UI(달성률·streak·놓친 날) 금지 / 미래의 나 톤 일관성 /
사진·대화는 사용자 본인 것 / 정서적 위기 시 안전 응답으로 전환.
