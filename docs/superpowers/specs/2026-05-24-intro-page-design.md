# Intro Page — Design Spec

- **작성일**: 2026-05-24
- **상태**: Brainstorming 승인 완료, 구현 계획 단계로 진입 예정
- **목적**: 소개팅 상대(이하 "지수님")에게 공개 URL로 전달할 React 기반 자기소개 페이지. 핵심 인터랙션은 AI 챗봇 ("나의 분신") + 상단 손편지 노트.

---

## 1. 컨셉 & 톤

- **한 줄 컨셉**: "하루 본 사람에 대한 첫인상 노트 + 그 사람이 더 궁금할 때 직접 물어볼 수 있는 AI"
- **톤**: 위트는 베이스에 깔리되 표면은 **진지함 + 사려깊음**. "동생 같다"는 인상은 피한다. 존댓말 기본, 친근.
- **차별점**: 일반적인 자기소개 페이지는 "나"를 자랑한다. 이 페이지는 **상대방에 대한 내 시선을 먼저 보여주고**, 그 다음 나를 열어 보인다.

## 2. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│   브라우저 (Next.js App, React 18)                       │
│   ├─ <IntroNote/>      ← /content/intro-note.md         │
│   ├─ <Character/>      ← SVG, 표정 state로 모션 전환    │
│   └─ <Chat/>           ← 메시지 UI, localStorage 보존   │
│                            ↓ POST /api/chat              │
└─────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────┐
│   Vercel Edge Function: /api/chat (≈ 50줄)               │
│   ├─ Rate limit (IP 기반, 분당 6회 / 일 30회)            │
│   ├─ Length guard (메시지 ≤ 500자)                       │
│   ├─ System prompt 조립 (Bio + Q&A + 페르소나 가이드)    │
│   └─ Anthropic Claude API 호출 (streaming)               │
└─────────────────────────────────────────────────────────┘
                             ↓
                  Claude Sonnet 4.6 API
```

- **DB 없음**. 챗 히스토리는 사용자 브라우저의 `localStorage`에만 보관. 새로고침 시 유지, 단말이 바뀌면 사라짐.
- **콘텐츠는 git 안의 정적 파일** (마크다운/JSON). 빌드 시점에 함께 배포됨.

## 3. 페이지 구조 & 레이아웃

단일 페이지 (라우팅 없음). 모바일 우선 (가로폭 480px 기준 설계). 데스크탑은 가운데 정렬 + 여백 큼.

```
┌─────────────────────────────────────────┐
│  FIRST IMPRESSION · 지수                 │ ← 작은 라벨
│                                          │
│  하루 만났을 뿐인데,                       │
│  말 사이의 침묵을 어색해하지 않는           │ ← 손편지처럼 typewriter
│  사람이라는 걸 알겠더라고요.                │
│                                          │
│  ─ 예환                                  │
│                                          │
│              ↓ 부드러운 페이드             │
│  ┌──────────┬───────────────────────┐   │
│  │  (얼굴)   │  안녕하세요, 지수님.    │   │
│  │  ◯ ◡ ◯   │  뭐가 제일 궁금해요?   │   │
│  │   ‿       │                       │   │
│  │  예환이   │  ┌────────────────┐  │   │
│  │           │  │ 메시지 입력...   │  │   │
│  └──────────┴───────────────────────┘   │
│                                          │
│       made with care · for 지수          │ ← 푸터
└─────────────────────────────────────────┘
```

**컴포넌트 트리**

```
<App>
  <IntroNote markdown={introNote} />
  <ChatStage>
    <Character expression={expressionState} />
    <Chat
      systemAccessor={/api/chat}
      storage={localStorage}
      onAssistantMessage={updateExpressionFromText}
    />
  </ChatStage>
  <Footer />
</App>
```

## 4. 비주얼 무드 — Sage & Bone

| Token | 값 |
|---|---|
| `--bg` | `#eee9df` (오프화이트 본 컬러) |
| `--surface` | `#ffffff` |
| `--ink` | `#3a3d35` (본문) |
| `--ink-muted` | `#7a8471` |
| `--accent` | `#588157` (세이지 그린) |
| `--accent-soft` | `#a3b18a` |
| `--shadow` | `0 1px 3px rgba(0,0,0,0.06)` |
| 본문 폰트 | Pretendard (한글), Inter (라틴) |
| 라벨 폰트 | Inter Tight, 영문 대문자, letter-spacing 0.25em |
| 본문 사이즈 | 모바일 16px / 데스크 17px, line-height 1.55 |

## 5. 콘텐츠 형식 (사용자가 채우는 파일)

```
/content/
  intro-note.md     ← "내가 느끼는 지수님" 노트 (1-2 문단)
  bio.md            ← 본인 소개 (한 페이지, ≤ 1500자)
  qa.json           ← 진심 Q&A 30개
  persona.md        ← AI 페르소나 가이드 (톤, 금기, 말투 예시)
```

**`qa.json` 스키마**

```json
[
  {
    "q": "주말에 뭐 해요?",
    "a": "주로 동네 카페에서 책 읽거나 클라이밍장 가요. 사람 많은 데를 좋아하진 않아요.",
    "tags": ["일상", "취미"]
  }
]
```

**`persona.md`에 들어가야 할 가이드 (예시)**

> 위트는 있지만 가벼움보다는 사려깊음이 표면에 있다. 동생 같은 말투 금지.
> 존댓말 기본, 다만 친근. 모르는 건 솔직히 모른다고 말한다.
> 불편한 질문은 정중히 다른 화제로 옮긴다.
> 자기 자랑 금지. 상대를 비교 대상으로 만들지 않는다.

## 6. 인터랙션 & 애니메이션

라이브러리: **Framer Motion**. 모든 트랜지션 ease-out, 200~600ms. 과한 모션 금지.

**캐릭터 표정 state는 6종으로 고정**: `idle`, `thinking`, `talking`, `smiling`, `serious`, `blank`.

| 순간 | 애니메이션 | 캐릭터 표정 |
|---|---|---|
| 페이지 로드 (0~0.6s) | 라벨 페이드인 | `idle` |
| 노트 등장 (0.6~2.5s) | typewriter, 한 줄 1.5s | `idle` |
| 노트 → 챗 전환 (2.5~3.3s) | 노트가 살짝 위로, 챗 슬라이드업 | `idle` |
| 사용자 입력 중 | (대기) | `idle` (눈동자만 입력창 쪽으로 부드럽게 이동 — 별도 state 아님) |
| 전송 → 응답 대기 | 점 3개 위로 펄스 | `thinking` (눈 감김) |
| 응답 스트리밍 | 텍스트 한 글자씩 페이드인 | `talking` (입 살짝 벌어짐) |
| 응답 완료 (긍정/일상) | (정지) | `smiling` |
| 응답 완료 (진지/사려깊은) | (정지) | `serious` |
| 에러 | 메시지 등장 | `blank` (눈 점 두 개, 입 일자) |

**캐릭터 표정 매핑 방식**: 응답 텍스트를 클라이언트에서 가벼운 키워드 룩업 (웃음·긍정 표현 → `smiling`, 진지·고민 표현 → `serious`)으로 1-shot 분류. LLM 추가 호출 없음. 매핑 실패 시 `idle`로 fallback.

## 7. API & 보안 (`/api/chat`)

```typescript
// app/api/chat/route.ts (Edge Runtime)
export const runtime = 'edge';

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for');
  if (!await rateLimitOK(ip)) return rateLimit();      // 분당 6회 / 일 30회
  const { messages } = await req.json();
  if (totalLen(messages) > 4000) return tooLong();      // 컨텍스트 가드
  const system = buildSystemPrompt(bio, qa, persona);   // ~3K tokens
  return streamFromClaude({ system, messages, model: 'claude-sonnet-4-6' });
}
```

- **API 키**: `ANTHROPIC_API_KEY`는 Vercel 환경변수. 클라이언트 절대 노출 금지.
- **Rate limit**: Vercel KV (무료 티어). IP당 분당 6회 / 일 30회. 키 형식 `rl:{ip}:{minute|day}`.
- **가드레일 (시스템 프롬프트)**: "이런 질문은 정중히 거절하고 다른 화제로 옮긴다" 명시.
- **로깅 정책**: 사용자 메시지 본문은 저장하지 않는다 (지수님 프라이버시). 호출 횟수와 에러 코드만 Vercel Analytics에 집계.
- **모델**: Claude Sonnet 4.6 (`claude-sonnet-4-6`). 사용량이 적어 비용 영향 미미 (예상 월 USD 1 미만).

## 8. 배포 & 운영

- **호스팅**: Vercel Hobby 플랜 (무료). `vercel --prod`.
- **도메인**: 기본 `lazy-work-{hash}.vercel.app`. 본인 도메인 있을 시 연결 가능.
- **환경변수**: `ANTHROPIC_API_KEY` (필수, 없으면 빌드 실패). `KV_*` (Vercel KV가 자동 주입).
- **전달 방식**: 배포 후 URL을 카카오톡 등으로 공유. URL 자체 외에 인증 없음.
- **호환성**: 카카오톡 인앱 브라우저, Safari iOS, Chrome Android, 데스크탑 모던 브라우저. 카카오 인앱은 폰트 로딩과 `localStorage` 동작 확인 필수.

## 9. 에지케이스 & 에러 처리

| 상황 | 처리 |
|---|---|
| Anthropic API 실패 | "잠깐 정신줄을 놨네요. 다시 한 번만 보내주세요." + 캐릭터 멍한 표정 |
| Rate limit 초과 | "오늘 충분히 얘기한 것 같아요. 직접 연락해서 물어봐 주세요 :)" |
| 부적절한 질문 | 페르소나 가이드 → 정중히 다른 화제 제안 |
| `ANTHROPIC_API_KEY` 누락 | 빌드 fail (배포 차단) |
| 카카오톡 인앱 글꼴 깨짐 | Pretendard 자체 호스팅 + woff2, 시스템 폰트 fallback |
| 새로고침 | localStorage에서 챗 복원 |
| 메시지 너무 김 (>500자) | 클라이언트에서 막고 안내 토스트 |
| 컨텍스트 너무 김 (>4000 tokens) | 가장 오래된 메시지 제거 후 재시도 |

## 10. 테스트 전략

- **시각 테스트 (수동)**: 데스크탑 Chrome, iPhone Safari, Android Chrome, 카카오톡 인앱 브라우저. 화면 캡처를 docs에 모아 비교.
- **챗 시나리오 테스트 (수동)**: 30개 Q&A를 직접 물어보고 답변 톤·정확성 점검 → `persona.md` 튜닝.
- **금기 질문 테스트 (수동)**: 10가지 부적절·과한 질문 → 거절 동작 확인.
- **API 단위 테스트 (Vitest)**: rate limit, 시스템 프롬프트 길이 가드, 에러 핸들링.
- **컴포넌트 시각 테스트**: Character SVG의 표정 state 6종을 Storybook 또는 단일 디버그 페이지에서 확인.

## 11. 기술 스택 요약

| 항목 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) | Vercel Edge Function과 자연스러운 통합, RSC로 콘텐츠 정적 로딩 |
| 언어 | TypeScript | strict mode |
| 스타일 | Tailwind CSS | sage 토큰 커스텀 |
| 애니메이션 | Framer Motion | de facto 표준 |
| 폰트 | Pretendard + Inter | 한글·라틴 균형 |
| 캐릭터 | SVG + Framer Motion | 외부 이미지 없음, 코드만으로 표정 전환 |
| LLM | Anthropic Claude Sonnet 4.6 (streaming) | 톤 자연스러움 |
| 호스팅 | Vercel Hobby | 무료, Next.js와 가장 잘 맞음 |
| Rate limit | Vercel KV | 무료, 설정 간단 |
| 테스트 | Vitest (단위) + 수동 시나리오 | 사용자 수 적고 콘텐츠 톤이 핵심 |

## 12. 사용자(예환)가 해야 할 작성 작업

| 산출물 | 양 | 예상 시간 |
|---|---|---|
| `intro-note.md` | 1~2 문단 | 30분 |
| `bio.md` | ≤ 1500자 | 1시간 |
| `qa.json` (Q&A 30개) | 짧은 답변 30개 | 2~3시간 |
| `persona.md` | 가이드 + 톤 예시 | 30분 |
| **합계** | | **4~5시간** |

## 13. 비범위 (Out of Scope)

- 다크 모드 (필요 시 후속)
- 사운드/햅틱
- 본인 사진 (1차 버전엔 SVG 캐릭터만)
- 다국어 (한국어 only)
- 챗 히스토리 서버 저장
- 회원가입/로그인
- 분석 대시보드 (Vercel Analytics 자동 외엔 없음)

## 14. 열린 질문 (다음 단계에서 확정)

- Q&A 30개의 카테고리 분포 (일상 / 가치관 / 관계 / 취향 / 일 / 미래 / 농담 등)
- 캐릭터의 표정 6종 정확한 SVG 디테일
- `intro-note.md`의 첫 문장 후보 2~3개 (디자인 톤 검증용)
- 도메인 사용 여부

---

> 이 문서는 brainstorming 단계의 결과물이다. 다음 단계는 `writing-plans` 스킬을 통한 구현 계획서 작성.
