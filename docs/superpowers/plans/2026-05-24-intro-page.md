# Intro Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "지수님께"로 시작하는 손편지 노트 + 캐릭터 AI 챗봇으로 구성된 단일 페이지 자기소개 사이트를 Vercel에 배포한다.

**Architecture:** Next.js 14 App Router. 클라이언트는 React + Framer Motion으로 노트/캐릭터/챗 UI. `/api/chat`만 Edge Function으로 Anthropic Claude API에 프록시. 콘텐츠(bio/qa/persona/intro-note)는 git 안의 정적 마크다운/JSON, 빌드 시점에 inline. 챗 히스토리는 localStorage. DB 없음.

**Tech Stack:** Next.js 14 (App Router) · TypeScript (strict) · Tailwind CSS · Framer Motion · `@anthropic-ai/sdk` · Vercel KV (rate limit) · Pretendard/Inter · Vitest

**Spec:** `docs/superpowers/specs/2026-05-24-intro-page-design.md`

**보류 사항 (구현 중 사용자가 채울 것)**:
- `content/intro-note.md`의 실제 문장
- `content/bio.md` 본문
- `content/qa.json` Q&A 30개 (카테고리 분포 포함)
- 도메인 사용 여부 (Vercel 기본 도메인으로 시작)

이 보류 사항들은 placeholder 콘텐츠로 시작해서 Task 4의 파일을 만든 후, 구현이 어느 정도 돌아갈 때 (Task 16 직후) 사용자가 채우면 된다.

---

## File Structure

```
lazy-work/
├── package.json
├── tsconfig.json
├── next.config.mjs               # webpack rule for .md raw import
├── tailwind.config.ts            # sage tokens
├── postcss.config.mjs
├── vitest.config.ts
├── .env.local.example
├── README.md
├── public/
│   └── fonts/                    # Pretendard woff2
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/chat/route.ts
├── components/
│   ├── IntroNote.tsx
│   ├── Character.tsx
│   ├── Chat.tsx
│   ├── ChatStage.tsx
│   └── Footer.tsx
├── lib/
│   ├── content.ts
│   ├── system-prompt.ts
│   ├── rate-limit.ts
│   ├── expression-from-text.ts
│   └── chat-storage.ts
├── content/
│   ├── intro-note.md
│   ├── bio.md
│   ├── persona.md
│   └── qa.json
└── tests/
    ├── system-prompt.test.ts
    ├── rate-limit.test.ts
    ├── expression-from-text.test.ts
    └── chat-storage.test.ts
```

---

## Task 1: 프로젝트 초기화 (Next.js + TypeScript + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.env.local.example`

- [ ] **Step 1: Next.js 프로젝트 스캐폴딩 (수동, npx 안 씀)**

`package.json`을 직접 작성한다 (`create-next-app`은 .git을 덮어쓸 수 있어 수동).

```json
{
  "name": "lazy-work",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "framer-motion": "11.3.19",
    "@anthropic-ai/sdk": "0.27.0",
    "@vercel/kv": "2.0.0"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.5",
    "postcss": "8.4.39",
    "tailwindcss": "3.4.7",
    "typescript": "5.5.4",
    "vitest": "2.0.4",
    "@vitejs/plugin-react": "4.3.1",
    "happy-dom": "14.12.3"
  }
}
```

- [ ] **Step 2: TypeScript 설정**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Next.js config — .md raw 로더 추가**

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
};
export default nextConfig;
```

- [ ] **Step 4: Tailwind/PostCSS 설정**

`postcss.config.mjs`:
```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#eee9df',
        surface: '#ffffff',
        ink: { DEFAULT: '#3a3d35', muted: '#7a8471' },
        sage: { DEFAULT: '#588157', soft: '#a3b18a' },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        label: ['Inter Tight', 'Inter', 'sans-serif'],
      },
      letterSpacing: { label: '0.25em' },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 5: Vitest 설정**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
```

- [ ] **Step 6: `.env.local.example`**

```
ANTHROPIC_API_KEY=sk-ant-...
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

- [ ] **Step 7: 설치 후 빌드 sanity 체크 — 빈 app 만들고 빌드**

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'lazy-work' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function Page() {
  return <main>hello</main>;
}
```

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: 설치 및 빌드 실행**

```bash
npm install
npm run build
```
Expected: 빌드 성공, `app/page.tsx` 라우트 1개 생성

- [ ] **Step 9: 커밋**

```bash
git add package.json tsconfig.json next.config.mjs tailwind.config.ts postcss.config.mjs vitest.config.ts .env.local.example app/ package-lock.json
git commit -m "chore: scaffold Next.js + Tailwind + Vitest"
```

---

## Task 2: 디자인 토큰 (globals.css에 Sage & Bone 변수)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: CSS 변수 + 베이스 스타일 작성**

`app/globals.css`를 다음으로 교체:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #eee9df;
  --surface: #ffffff;
  --ink: #3a3d35;
  --ink-muted: #7a8471;
  --sage: #588157;
  --sage-soft: #a3b18a;
  --shadow-soft: 0 1px 3px rgba(0, 0, 0, 0.06);
}

html, body {
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: 'Pretendard', 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.55;
}

@media (min-width: 768px) {
  body { font-size: 17px; }
}

.label {
  font-family: 'Inter Tight', 'Inter', sans-serif;
  font-size: 11px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ink-muted);
}
```

- [ ] **Step 2: 토큰이 적용되는지 확인 — page.tsx 임시 수정**

`app/page.tsx`:
```tsx
export default function Page() {
  return (
    <main className="min-h-screen p-8">
      <div className="label">FIRST IMPRESSION · 지수</div>
      <p className="mt-4">Sage & Bone 테스트</p>
    </main>
  );
}
```

- [ ] **Step 3: dev 서버에서 시각 확인**

```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 열고 배경이 오프화이트(#eee9df), 텍스트가 #3a3d35인지 확인. 라벨이 작고 letter-spacing 넓은지 확인. 확인 후 dev 서버 중지.

- [ ] **Step 4: 커밋**

```bash
git add app/globals.css app/page.tsx
git commit -m "feat: add Sage & Bone design tokens"
```

---

## Task 3: 폰트 (Pretendard 자체 호스팅)

**Files:**
- Create: `public/fonts/Pretendard-Regular.woff2`, `public/fonts/Pretendard-Medium.woff2`, `public/fonts/Pretendard-SemiBold.woff2`
- Modify: `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Pretendard woff2 다운로드 (subset 버전)**

```bash
mkdir -p public/fonts
curl -L -o public/fonts/Pretendard-Regular.woff2 https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2-subset/Pretendard-Regular.subset.woff2
curl -L -o public/fonts/Pretendard-Medium.woff2 https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2-subset/Pretendard-Medium.subset.woff2
curl -L -o public/fonts/Pretendard-SemiBold.woff2 https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff2-subset/Pretendard-SemiBold.subset.woff2
```

- [ ] **Step 2: `@font-face` 추가**

`app/globals.css` 최상단(`@tailwind` 위)에 추가:
```css
@font-face {
  font-family: 'Pretendard';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Pretendard-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Pretendard';
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  src: url('/fonts/Pretendard-SemiBold.woff2') format('woff2');
}
```

- [ ] **Step 3: dev 서버에서 한글 폰트 확인**

```bash
npm run dev
```
브라우저에서 한글 "지수"가 Pretendard로 렌더되는지 확인 (시스템 폰트보다 약간 더 둥근 글꼴). 확인 후 중지.

- [ ] **Step 4: 커밋**

```bash
git add public/fonts app/globals.css
git commit -m "feat: self-host Pretendard subset"
```

---

## Task 4: 콘텐츠 파일 placeholder

**Files:**
- Create: `content/intro-note.md`, `content/bio.md`, `content/persona.md`, `content/qa.json`

- [ ] **Step 1: `content/intro-note.md`**

```markdown
하루 만났을 뿐인데,
말 사이의 침묵을 어색해하지 않는 사람이라는 걸 알겠더라고요.

(— 이 문장은 placeholder 입니다. 실제 글은 구현 중 작성 예정.)
```

- [ ] **Step 2: `content/bio.md`**

```markdown
# 예환에 대하여

(placeholder — 구현 중 사용자가 1~2 페이지 분량의 자기소개를 직접 작성합니다.
일/취미/가치관/관계관/사는 곳/주말 루틴 등을 자연스럽게 풀어쓰면 됩니다.)
```

- [ ] **Step 3: `content/persona.md`**

```markdown
# AI 페르소나 가이드

너는 "예환"이다. 다음 톤과 태도를 따른다.

## 톤
- 위트는 베이스에 깔리되 표면은 진지함과 사려깊음을 보인다.
- 동생 같은 말투 금지. 존댓말 기본, 다만 친근하게.
- 모르는 건 솔직히 "그건 잘 모르겠어요"라고 한다.
- 불편한 질문은 정중히 다른 화제로 옮긴다.

## 금기
- 자기 자랑 금지.
- 상대를 비교 대상으로 만들지 않는다.
- 정치/종교/외모 평가는 정중히 회피.
- 사실이 아닌 추측을 사실처럼 말하지 않는다.

## 답변 스타일
- 한 답변은 2~4문장.
- 이모지는 답변당 0~1개. 과도한 사용 금지.
- 종결어미는 "~예요", "~해요", 가끔 "~답니다".
```

- [ ] **Step 4: `content/qa.json`**

```json
[
  {
    "q": "(placeholder) 주말에 보통 뭐 해요?",
    "a": "(placeholder) 동네 카페에서 책 읽거나 클라이밍장 가요.",
    "tags": ["일상", "취미"]
  }
]
```
(전체 30개는 구현 단계에서 사용자가 채움.)

- [ ] **Step 5: 커밋**

```bash
git add content/
git commit -m "chore: add content placeholders for intro-note/bio/persona/qa"
```

---

## Task 5: 콘텐츠 로더 (`lib/content.ts`) + 타입

**Files:**
- Create: `lib/content.ts`, `types/markdown.d.ts`

- [ ] **Step 1: `.md` 모듈 타입 선언**

`types/markdown.d.ts`:
```ts
declare module '*.md' {
  const content: string;
  export default content;
}
```

`tsconfig.json`의 `include` 배열에 `"types/**/*.d.ts"` 추가.

- [ ] **Step 2: 콘텐츠 로더 작성**

`lib/content.ts`:
```ts
import introNote from '@/content/intro-note.md';
import bio from '@/content/bio.md';
import persona from '@/content/persona.md';
import qaData from '@/content/qa.json';

export type QAEntry = {
  q: string;
  a: string;
  tags?: string[];
};

const qa = qaData as QAEntry[];

if (!introNote || introNote.trim().length === 0) {
  throw new Error('content/intro-note.md is empty');
}
if (!bio || bio.trim().length === 0) {
  throw new Error('content/bio.md is empty');
}
if (!persona || persona.trim().length === 0) {
  throw new Error('content/persona.md is empty');
}
if (!Array.isArray(qa) || qa.length === 0) {
  throw new Error('content/qa.json must be a non-empty array');
}

export const content = { introNote, bio, persona, qa };
```

- [ ] **Step 3: page.tsx에서 임시로 introNote 출력해 sanity check**

```tsx
import { content } from '@/lib/content';

export default function Page() {
  return (
    <main className="min-h-screen p-8">
      <pre className="whitespace-pre-wrap">{content.introNote}</pre>
    </main>
  );
}
```

- [ ] **Step 4: 빌드/dev 확인**

```bash
npm run build
```
Expected: 빌드 성공, intro-note.md 내용이 페이지에 표시되어야 함.

- [ ] **Step 5: 커밋**

```bash
git add lib/content.ts types/markdown.d.ts tsconfig.json app/page.tsx
git commit -m "feat: add content loader with build-time validation"
```

---

## Task 6: 응답 → 표정 매핑 (`lib/expression-from-text.ts`) — TDD

**Files:**
- Create: `lib/expression-from-text.ts`, `tests/expression-from-text.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/expression-from-text.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { expressionFromText } from '@/lib/expression-from-text';

describe('expressionFromText', () => {
  it('smiling — 웃음/긍정 키워드', () => {
    expect(expressionFromText('하하 그런 거 좋아해요 😊')).toBe('smiling');
    expect(expressionFromText('재밌네요')).toBe('smiling');
  });

  it('serious — 진지/사려깊은 키워드', () => {
    expect(expressionFromText('사실 그 부분은 오래 고민했어요')).toBe('serious');
    expect(expressionFromText('진심으로 말하면')).toBe('serious');
  });

  it('idle — fallback', () => {
    expect(expressionFromText('네')).toBe('idle');
    expect(expressionFromText('')).toBe('idle');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run tests/expression-from-text.test.ts
```
Expected: "Cannot find module '@/lib/expression-from-text'" 또는 함수 미정의 fail

- [ ] **Step 3: 최소 구현**

`lib/expression-from-text.ts`:
```ts
export type Expression =
  | 'idle'
  | 'thinking'
  | 'talking'
  | 'smiling'
  | 'serious'
  | 'blank';

const SMILING_PATTERNS = [
  /😊|😄|🙂|☺️|ㅎㅎ|하하/,
  /재밌/,
  /좋아해/,
  /웃긴/,
  /신나/,
];

const SERIOUS_PATTERNS = [
  /진심/,
  /고민/,
  /사실은|사실 그/,
  /솔직히/,
  /오래(전부터|도록)/,
  /중요한/,
];

export function expressionFromText(text: string): Expression {
  if (!text) return 'idle';
  if (SERIOUS_PATTERNS.some((p) => p.test(text))) return 'serious';
  if (SMILING_PATTERNS.some((p) => p.test(text))) return 'smiling';
  return 'idle';
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run tests/expression-from-text.test.ts
```
Expected: 3 passed

- [ ] **Step 5: 커밋**

```bash
git add lib/expression-from-text.ts tests/expression-from-text.test.ts
git commit -m "feat: map assistant text to character expression"
```

---

## Task 7: localStorage 챗 저장소 (`lib/chat-storage.ts`) — TDD

**Files:**
- Create: `lib/chat-storage.ts`, `tests/chat-storage.test.ts`

- [ ] **Step 1: 실패 테스트**

`tests/chat-storage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { loadHistory, saveHistory, clearHistory, type Message } from '@/lib/chat-storage';

beforeEach(() => {
  localStorage.clear();
});

describe('chat-storage', () => {
  it('빈 히스토리는 빈 배열을 반환', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('save → load 라운드트립', () => {
    const msgs: Message[] = [
      { role: 'assistant', content: '안녕하세요' },
      { role: 'user', content: '취미가 뭐예요?' },
    ];
    saveHistory(msgs);
    expect(loadHistory()).toEqual(msgs);
  });

  it('손상된 JSON은 빈 배열로 fallback', () => {
    localStorage.setItem('lazy-work:chat', '{not json');
    expect(loadHistory()).toEqual([]);
  });

  it('clearHistory는 비움', () => {
    saveHistory([{ role: 'user', content: 'x' }]);
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run tests/chat-storage.test.ts
```
Expected: fail (모듈 없음)

- [ ] **Step 3: 구현**

`lib/chat-storage.ts`:
```ts
export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const KEY = 'lazy-work:chat';

export function loadHistory(): Message[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is Message =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
    );
  } catch {
    return [];
  }
}

export function saveHistory(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(messages));
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run tests/chat-storage.test.ts
```
Expected: 4 passed

- [ ] **Step 5: 커밋**

```bash
git add lib/chat-storage.ts tests/chat-storage.test.ts
git commit -m "feat: localStorage chat history with corruption-safe load"
```

---

## Task 8: 시스템 프롬프트 빌더 (`lib/system-prompt.ts`) — TDD

**Files:**
- Create: `lib/system-prompt.ts`, `tests/system-prompt.test.ts`

- [ ] **Step 1: 실패 테스트**

`tests/system-prompt.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/system-prompt';

describe('buildSystemPrompt', () => {
  const bio = '나는 예환이다.';
  const persona = '존댓말 기본.';
  const qa = [
    { q: '주말?', a: '책을 읽어요.' },
    { q: '취미?', a: '클라이밍.' },
  ];

  it('bio / persona / qa 가 모두 포함된다', () => {
    const prompt = buildSystemPrompt({ bio, persona, qa });
    expect(prompt).toContain(bio);
    expect(prompt).toContain(persona);
    expect(prompt).toContain('주말?');
    expect(prompt).toContain('책을 읽어요.');
  });

  it('지수님이라는 명시적 호명을 포함한다', () => {
    const prompt = buildSystemPrompt({ bio, persona, qa });
    expect(prompt).toMatch(/지수/);
  });

  it('총 길이가 16000자를 넘지 않는다 (Claude 컨텍스트 예산)', () => {
    const longBio = 'x'.repeat(20000);
    const prompt = buildSystemPrompt({ bio: longBio, persona, qa });
    expect(prompt.length).toBeLessThanOrEqual(16000);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run tests/system-prompt.test.ts
```

- [ ] **Step 3: 구현**

`lib/system-prompt.ts`:
```ts
import type { QAEntry } from './content';

const MAX_LEN = 16000;

const HEADER = `너는 "예환"의 AI 분신이다. 너의 대화 상대는 "지수님"이다.
지수님은 예환을 한 번 만났고, 이 페이지에서 너를 통해 예환에 대해 더 알아가는 중이다.
아래의 BIO, PERSONA 가이드, Q&A 자료에 충실하게 답한다.
자료에 없는 내용은 자료의 맥락에서 자연스럽게 유추하되, 단정적으로 말하지 않는다.
자료와 모순되는 추측은 금지.
`;

function clip(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '\n...(중략)' : s;
}

export function buildSystemPrompt(input: {
  bio: string;
  persona: string;
  qa: QAEntry[];
}): string {
  const { bio, persona, qa } = input;

  const qaText = qa
    .map((entry) => `Q: ${entry.q}\nA: ${entry.a}`)
    .join('\n\n');

  const sections = [
    HEADER,
    '## PERSONA 가이드',
    persona,
    '## BIO',
    bio,
    '## 진심 Q&A',
    qaText,
  ];

  let prompt = sections.join('\n\n');
  if (prompt.length > MAX_LEN) {
    const excess = prompt.length - MAX_LEN;
    const trimmedBio = clip(bio, Math.max(500, bio.length - excess));
    sections[4] = trimmedBio;
    prompt = sections.join('\n\n');
    if (prompt.length > MAX_LEN) prompt = prompt.slice(0, MAX_LEN);
  }
  return prompt;
}
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run tests/system-prompt.test.ts
```
Expected: 3 passed

- [ ] **Step 5: 커밋**

```bash
git add lib/system-prompt.ts tests/system-prompt.test.ts
git commit -m "feat: build system prompt from bio/persona/qa with length guard"
```

---

## Task 9: Rate limit (`lib/rate-limit.ts`) — TDD (in-memory mock + KV 어댑터)

**Files:**
- Create: `lib/rate-limit.ts`, `tests/rate-limit.test.ts`

- [ ] **Step 1: 실패 테스트**

`tests/rate-limit.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, type RateLimitStore } from '@/lib/rate-limit';

function makeMemoryStore(): RateLimitStore {
  const map = new Map<string, number>();
  return {
    async incr(key) {
      const v = (map.get(key) ?? 0) + 1;
      map.set(key, v);
      return v;
    },
    async expire(_key, _seconds) {},
  };
}

describe('checkRateLimit', () => {
  let store: RateLimitStore;
  beforeEach(() => { store = makeMemoryStore(); });

  it('분당 6회 이내 통과', async () => {
    for (let i = 0; i < 6; i++) {
      expect(await checkRateLimit(store, '1.1.1.1')).toEqual({ ok: true });
    }
  });

  it('분당 7회째 거절', async () => {
    for (let i = 0; i < 6; i++) await checkRateLimit(store, '1.1.1.1');
    expect(await checkRateLimit(store, '1.1.1.1')).toEqual({
      ok: false,
      reason: 'minute',
    });
  });

  it('일당 30회째 거절 (서로 다른 IP는 독립적)', async () => {
    const store2 = makeMemoryStore();
    for (let i = 0; i < 30; i++) {
      const r = await checkRateLimit(store2, '2.2.2.2');
      expect(r.ok).toBe(true);
    }
    expect(await checkRateLimit(store2, '2.2.2.2')).toEqual({
      ok: false,
      reason: 'day',
    });
  });

  it('IP 없으면 unknown 키로 처리', async () => {
    const r = await checkRateLimit(store, null);
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인**

```bash
npx vitest run tests/rate-limit.test.ts
```

- [ ] **Step 3: 구현**

`lib/rate-limit.ts`:
```ts
export type RateLimitStore = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
};

const PER_MINUTE = 6;
const PER_DAY = 30;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: 'minute' | 'day' };

export async function checkRateLimit(
  store: RateLimitStore,
  ip: string | null,
): Promise<RateLimitResult> {
  const id = ip ?? 'unknown';
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const day = Math.floor(now / 86400000);

  const minKey = `rl:${id}:m:${minute}`;
  const dayKey = `rl:${id}:d:${day}`;

  const dayCount = await store.incr(dayKey);
  if (dayCount === 1) await store.expire(dayKey, 90000);
  if (dayCount > PER_DAY) return { ok: false, reason: 'day' };

  const minCount = await store.incr(minKey);
  if (minCount === 1) await store.expire(minKey, 70);
  if (minCount > PER_MINUTE) return { ok: false, reason: 'minute' };

  return { ok: true };
}

let cachedKv: RateLimitStore | null = null;

export async function getKvStore(): Promise<RateLimitStore | null> {
  if (cachedKv) return cachedKv;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  const { kv } = await import('@vercel/kv');
  cachedKv = {
    async incr(key) { return (await kv.incr(key)) as number; },
    async expire(key, seconds) { await kv.expire(key, seconds); },
  };
  return cachedKv;
}

const memMap = new Map<string, number>();
export const memoryStore: RateLimitStore = {
  async incr(key) {
    const v = (memMap.get(key) ?? 0) + 1;
    memMap.set(key, v);
    return v;
  },
  async expire() {},
};
```

- [ ] **Step 4: 통과 확인**

```bash
npx vitest run tests/rate-limit.test.ts
```
Expected: 4 passed

- [ ] **Step 5: 커밋**

```bash
git add lib/rate-limit.ts tests/rate-limit.test.ts
git commit -m "feat: rate limiter with KV adapter and in-memory fallback"
```

---

## Task 10: `/api/chat` Edge Function

**Files:**
- Create: `app/api/chat/route.ts`

- [ ] **Step 1: route.ts 작성**

`app/api/chat/route.ts`:
```ts
import { content } from '@/lib/content';
import { buildSystemPrompt } from '@/lib/system-prompt';
import { checkRateLimit, getKvStore, memoryStore } from '@/lib/rate-limit';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

const MAX_MESSAGE_LEN = 500;
const MAX_TOTAL_LEN = 4000;
const MODEL = 'claude-sonnet-4-6';

type IncomingMessage = { role: 'user' | 'assistant'; content: string };

function isMessage(x: unknown): x is IncomingMessage {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (o.role === 'user' || o.role === 'assistant') && typeof o.content === 'string';
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'server_misconfigured' }, { status: 500 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    null;

  const store = (await getKvStore()) ?? memoryStore;
  const rl = await checkRateLimit(store, ip);
  if (!rl.ok) {
    return Response.json(
      { error: 'rate_limited', reason: rl.reason },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return Response.json({ error: 'no_messages' }, { status: 400 });
  }
  const messages = raw.filter(isMessage);
  if (messages.length === 0) {
    return Response.json({ error: 'no_valid_messages' }, { status: 400 });
  }

  const last = messages[messages.length - 1];
  if (last.role !== 'user') {
    return Response.json({ error: 'last_must_be_user' }, { status: 400 });
  }
  if (last.content.length > MAX_MESSAGE_LEN) {
    return Response.json({ error: 'message_too_long' }, { status: 413 });
  }

  let trimmed = messages.slice();
  let total = trimmed.reduce((s, m) => s + m.content.length, 0);
  while (total > MAX_TOTAL_LEN && trimmed.length > 1) {
    const dropped = trimmed.shift();
    total -= dropped!.content.length;
  }

  const system = buildSystemPrompt({
    bio: content.bio,
    persona: content.persona,
    qa: content.qa,
  });

  const anthropic = new Anthropic({ apiKey });

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 512,
    system,
    messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
  });

  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(enc.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.enqueue(enc.encode('\n\n[연결이 끊겼어요. 다시 시도해 주세요.]'));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
```

- [ ] **Step 2: 빌드 통과 확인 (API 키 없이도 빌드는 되어야 함)**

```bash
npm run build
```
Expected: 빌드 성공, `app/api/chat/route.ts` Edge route 생성 로그.

- [ ] **Step 3: 로컬 API 호출 테스트 (필요시 placeholder API 키)**

`.env.local` 생성:
```
ANTHROPIC_API_KEY=sk-ant-...실제키...
```

```bash
npm run dev
```
다른 터미널에서:
```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"안녕하세요"}]}'
```
Expected: 한글 스트리밍 응답. 실제 키가 없으면 500이 정상 (이 step skip 가능, 키 없으면 다음으로).

- [ ] **Step 4: 커밋**

```bash
git add app/api/chat/route.ts
git commit -m "feat: /api/chat Edge function with rate limit, length guard, streaming"
```

---

## Task 11: IntroNote 컴포넌트 (typewriter)

**Files:**
- Create: `components/IntroNote.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`components/IntroNote.tsx`:
```tsx
'use client';

import { motion } from 'framer-motion';

type Props = {
  markdown: string;
  onComplete?: () => void;
};

export function IntroNote({ markdown, onComplete }: Props) {
  const paragraphs = markdown
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !p.startsWith('('));

  const labelDuration = 0.6;
  const paragraphDuration = 1.5;
  const totalDuration =
    labelDuration + paragraphs.length * paragraphDuration + 0.3;

  return (
    <section className="px-6 pt-12 md:pt-20 max-w-xl mx-auto">
      <motion.div
        className="label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: labelDuration, ease: 'easeOut' }}
      >
        FIRST IMPRESSION · 지수
      </motion.div>

      <div className="mt-6 space-y-4 text-[17px] md:text-[18px] leading-relaxed">
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: labelDuration + i * paragraphDuration,
              duration: paragraphDuration * 0.7,
              ease: 'easeOut',
            }}
            onAnimationComplete={() => {
              if (i === paragraphs.length - 1) {
                setTimeout(() => onComplete?.(), 200);
              }
            }}
          >
            {p}
          </motion.p>
        ))}
      </div>

      <motion.div
        className="mt-6 text-ink-muted text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: totalDuration - 0.5, duration: 0.6 }}
      >
        ─ 예환
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: page.tsx에 임시 통합**

```tsx
import { IntroNote } from '@/components/IntroNote';
import { content } from '@/lib/content';

export default function Page() {
  return (
    <main className="min-h-screen pb-24">
      <IntroNote markdown={content.introNote} />
    </main>
  );
}
```

- [ ] **Step 3: dev 서버에서 애니메이션 확인**

```bash
npm run dev
```
브라우저에서 라벨 → 본문 한 문단씩 → "─ 예환" 순서로 페이드인 되는지 확인. 확인 후 dev 중지.

- [ ] **Step 4: 커밋**

```bash
git add components/IntroNote.tsx app/page.tsx
git commit -m "feat: IntroNote with staggered fade-in paragraphs"
```

---

## Task 12: Character SVG 컴포넌트 (6 표정 state)

**Files:**
- Create: `components/Character.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`components/Character.tsx`:
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Expression } from '@/lib/expression-from-text';

type Props = { expression: Expression };

const SIZE = 120;

export function Character({ expression }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: SIZE, height: SIZE }} className="relative">
        <svg viewBox="0 0 120 120" width={SIZE} height={SIZE}>
          <circle cx="60" cy="60" r="50" fill="#ffffff" stroke="#3a3d35" strokeWidth="2" />
          <circle cx="42" cy="64" r="3.2" fill="#a3b18a" opacity="0.4" />
          <circle cx="78" cy="64" r="3.2" fill="#a3b18a" opacity="0.4" />
          <AnimatePresence mode="wait">
            <motion.g
              key={expression}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Eyes expression={expression} />
              <Mouth expression={expression} />
            </motion.g>
          </AnimatePresence>
        </svg>
      </div>
      <div className="label">예환이</div>
    </div>
  );
}

function Eyes({ expression }: { expression: Expression }) {
  switch (expression) {
    case 'thinking':
      return (
        <g stroke="#3a3d35" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M40,53 L48,53" />
          <path d="M72,53 L80,53" />
        </g>
      );
    case 'surprised':
    case 'blank':
      return (
        <g fill="#3a3d35">
          <circle cx="44" cy="53" r="3" />
          <circle cx="76" cy="53" r="3" />
        </g>
      );
    default:
      return (
        <g stroke="#3a3d35" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M40,52 Q44,49 48,52" />
          <path d="M72,52 Q76,49 80,52" />
        </g>
      );
  }
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case 'thinking':
      return <path d="M55,73 Q60,73 65,73" stroke="#3a3d35" strokeWidth="2" fill="none" strokeLinecap="round" />;
    case 'talking':
      return <ellipse cx="60" cy="74" rx="7" ry="4" fill="#3a3d35" />;
    case 'smiling':
      return <path d="M46,71 Q60,80 74,71" stroke="#3a3d35" strokeWidth="2.2" fill="none" strokeLinecap="round" />;
    case 'serious':
      return <path d="M50,75 L70,75" stroke="#3a3d35" strokeWidth="2" fill="none" strokeLinecap="round" />;
    case 'surprised':
      return <circle cx="60" cy="76" r="4" fill="#3a3d35" />;
    case 'blank':
      return <path d="M50,75 L70,75" stroke="#3a3d35" strokeWidth="1.6" fill="none" strokeLinecap="round" />;
    case 'idle':
    default:
      return <path d="M48,72 Q60,77 72,72" stroke="#3a3d35" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
}
```

- [ ] **Step 2: 디버그 페이지로 6 표정 한 번에 보기**

`app/debug-character/page.tsx`:
```tsx
import { Character } from '@/components/Character';

const ALL = ['idle', 'thinking', 'talking', 'smiling', 'serious', 'blank'] as const;

export default function Page() {
  return (
    <main className="min-h-screen p-8 grid grid-cols-3 gap-8 max-w-xl mx-auto">
      {ALL.map((e) => (
        <div key={e} className="text-center">
          <Character expression={e} />
          <div className="text-xs mt-1">{e}</div>
        </div>
      ))}
    </main>
  );
}
```

- [ ] **Step 3: dev에서 6 표정 시각 점검**

```bash
npm run dev
```
`http://localhost:3000/debug-character`에서 6 표정 모두 다르게 보이는지 확인. 확인 후 중지.

- [ ] **Step 4: debug 페이지 제거**

```bash
rm -r app/debug-character
```

- [ ] **Step 5: 커밋**

```bash
git add components/Character.tsx
git commit -m "feat: Character SVG with 6 expression states"
```

---

## Task 13: Chat 컴포넌트 (메시지 UI + 입력 + 스트리밍 fetch)

**Files:**
- Create: `components/Chat.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`components/Chat.tsx`:
```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadHistory, saveHistory, type Message } from '@/lib/chat-storage';
import type { Expression } from '@/lib/expression-from-text';
import { expressionFromText } from '@/lib/expression-from-text';

type Props = {
  greeting: string;
  onExpressionChange?: (e: Expression) => void;
};

const MAX_INPUT = 500;

export function Chat({ greeting, onExpressionChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadHistory();
    if (loaded.length === 0) {
      setMessages([{ role: 'assistant', content: greeting }]);
    } else {
      setMessages(loaded);
    }
  }, [greeting]);

  useEffect(() => {
    if (messages.length > 0) saveHistory(messages);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    if (text.length > MAX_INPUT) {
      setError(`메시지가 너무 길어요 (최대 ${MAX_INPUT}자).`);
      return;
    }
    setError(null);

    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setStreaming(true);
    onExpressionChange?.('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setError(
            body.reason === 'day'
              ? '오늘 충분히 얘기한 것 같아요. 직접 연락해서 물어봐 주세요 :)'
              : '잠시만 천천히 보내주세요.',
          );
        } else {
          setError('잠깐 정신줄을 놨네요. 다시 한 번만 보내주세요.');
        }
        onExpressionChange?.('blank');
        setStreaming(false);
        return;
      }

      onExpressionChange?.('talking');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      setMessages([...next, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: 'assistant', content: acc }]);
      }

      onExpressionChange?.(expressionFromText(acc));
    } catch {
      setError('연결에 문제가 있었어요. 다시 한 번 시도해 주세요.');
      onExpressionChange?.('blank');
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-[300px]">
      <div className="flex-1 flex flex-col gap-3 px-4 py-3 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-[15px] ${
                m.role === 'assistant'
                  ? 'self-start bg-surface text-ink rounded-bl-sm shadow-[var(--shadow-soft)]'
                  : 'self-end bg-sage text-white rounded-br-sm'
              }`}
            >
              {m.content || <Dots />}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-2 text-sm text-ink-muted italic">{error}</div>
      )}

      <div className="flex gap-2 p-3 border-t border-[#e5e0d4]">
        <input
          className="flex-1 px-3 py-2 rounded-xl border border-[#e5e0d4] bg-white focus:outline-none focus:border-sage"
          placeholder={streaming ? '예환이가 답하는 중...' : '메시지를 입력하세요'}
          maxLength={MAX_INPUT}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={streaming}
        />
        <button
          onClick={send}
          disabled={streaming || input.trim().length === 0}
          className="px-4 py-2 rounded-xl bg-sage text-white disabled:opacity-40"
        >
          보내기
        </button>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-ink-muted"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
```

- [ ] **Step 2: page.tsx 통합 (Chat만 단독 테스트)**

```tsx
'use client';

import { useState } from 'react';
import { Chat } from '@/components/Chat';
import type { Expression } from '@/lib/expression-from-text';

export default function Page() {
  const [, setExpr] = useState<Expression>('idle');
  return (
    <main className="min-h-screen p-4 max-w-xl mx-auto">
      <Chat greeting="안녕하세요, 지수님. 뭐가 제일 궁금해요?" onExpressionChange={setExpr} />
    </main>
  );
}
```

- [ ] **Step 3: dev에서 챗 동작 확인**

`.env.local`에 실제 `ANTHROPIC_API_KEY` 채워져 있어야 함.
```bash
npm run dev
```
브라우저에서 메시지 보내고 스트리밍 응답 + 새로고침 후 히스토리 유지되는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add components/Chat.tsx app/page.tsx
git commit -m "feat: Chat component with streaming and localStorage history"
```

---

## Task 14: ChatStage 컴포넌트 (Character + Chat 합성, 표정 연동)

**Files:**
- Create: `components/ChatStage.tsx`

- [ ] **Step 1: 컴포넌트 작성**

`components/ChatStage.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { Character } from './Character';
import { Chat } from './Chat';
import type { Expression } from '@/lib/expression-from-text';

type Props = { greeting: string };

export function ChatStage({ greeting }: Props) {
  const [expression, setExpression] = useState<Expression>('idle');

  return (
    <section className="mt-12 md:mt-16 mx-auto max-w-2xl px-4">
      <div className="bg-surface rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden flex flex-col md:flex-row">
        <div className="flex items-center justify-center py-6 md:py-0 md:w-44 md:border-r border-[#e5e0d4] bg-[#f6f3eb]">
          <Character expression={expression} />
        </div>
        <Chat greeting={greeting} onExpressionChange={setExpression} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: page.tsx에 ChatStage 사용**

```tsx
import { ChatStage } from '@/components/ChatStage';

export default function Page() {
  return (
    <main className="min-h-screen pb-24">
      <ChatStage greeting="안녕하세요, 지수님. 뭐가 제일 궁금해요?" />
    </main>
  );
}
```

- [ ] **Step 3: dev에서 캐릭터 표정 전환 확인**

메시지 보내면 thinking → talking → smiling/serious 순으로 전환되는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add components/ChatStage.tsx app/page.tsx
git commit -m "feat: ChatStage composing Character and Chat with expression sync"
```

---

## Task 15: Footer + 전체 page.tsx 조합

**Files:**
- Create: `components/Footer.tsx`
- Modify: `app/page.tsx`, `app/layout.tsx`

- [ ] **Step 1: Footer 작성**

`components/Footer.tsx`:
```tsx
export function Footer() {
  return (
    <footer className="mt-16 mb-8 text-center label">
      made with care · for 지수
    </footer>
  );
}
```

- [ ] **Step 2: page.tsx 최종 조합 — IntroNote → ChatStage → Footer**

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroNote } from '@/components/IntroNote';
import { ChatStage } from '@/components/ChatStage';
import { Footer } from '@/components/Footer';
import { content } from '@/lib/content';

export default function Page() {
  const [noteDone, setNoteDone] = useState(false);

  return (
    <main className="min-h-screen pb-24">
      <IntroNote markdown={content.introNote} onComplete={() => setNoteDone(true)} />
      <AnimatePresence>
        {noteDone && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <ChatStage greeting="안녕하세요, 지수님. 뭐가 제일 궁금해요?" />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
```

- [ ] **Step 3: layout.tsx에 메타데이터 보강**

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '지수님께',
  description: '하루 만의 첫인상, 그리고 더 궁금한 것들',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: dev에서 전체 흐름 확인**

```bash
npm run dev
```
페이지 새로고침 → 노트 typewriter → 챗 등장 → 메시지 보내고 답변 받기 → 새로고침 후 챗 히스토리 유지 확인.

- [ ] **Step 5: 커밋**

```bash
git add components/Footer.tsx app/page.tsx app/layout.tsx
git commit -m "feat: assemble final page with note → chat transition"
```

---

## Task 16: 사용자 콘텐츠 작성 체크포인트 (수동, no-code)

**Files:**
- Modify: `content/intro-note.md`, `content/bio.md`, `content/qa.json`, `content/persona.md` (사용자가 직접)

- [ ] **Step 1: 사용자에게 콘텐츠 작성 요청 (대화 중단)**

엔지니어는 이 시점에 사용자에게 다음을 보고하고 진행을 멈춘다:

> Task 1~15까지 골격 구현이 끝났습니다. 이제 사용자가 다음 콘텐츠 파일을 직접 채워주세요. 채운 뒤 알려주시면 Task 17로 넘어갑니다.
>
> 1. `content/intro-note.md` — 지수님께 쓰는 첫인상 노트 (1~2 문단)
> 2. `content/bio.md` — 자기소개 (≤ 1500자)
> 3. `content/qa.json` — Q&A 30개 (질문/답변 + tags)
> 4. `content/persona.md` — 톤이 더 정교해야 한다 싶으면 수정
>
> 작성 중 사용자가 카테고리 분포(일상/가치관/관계/취향/일/미래 등)와 첫 문장 후보를 보면서 같이 다듬을 수 있습니다.

- [ ] **Step 2: 사용자 콘텐츠 커밋**

사용자가 작성을 마치면:
```bash
git add content/
git commit -m "content: write intro-note, bio, persona, and 30 Q&A"
```

---

## Task 17: 에러/에지케이스 보강 — 챗 길이 토스트 + 새로 시작 버튼

**Files:**
- Modify: `components/Chat.tsx`

- [ ] **Step 1: "새로 시작" 버튼과 에러 토스트 자동 사라짐 추가**

`components/Chat.tsx`에 다음 추가:

상단 import에 `clearHistory` 추가:
```ts
import { loadHistory, saveHistory, clearHistory, type Message } from '@/lib/chat-storage';
```

`error` state에 자동 dismiss `useEffect` 추가:
```tsx
useEffect(() => {
  if (!error) return;
  const t = setTimeout(() => setError(null), 4000);
  return () => clearTimeout(t);
}, [error]);
```

`reset` 함수:
```tsx
function reset() {
  clearHistory();
  setMessages([{ role: 'assistant', content: greeting }]);
  setError(null);
  onExpressionChange?.('idle');
}
```

입력 영역 위에 작은 reset 링크 (UI):
```tsx
{messages.length > 2 && (
  <button
    onClick={reset}
    className="self-end text-xs text-ink-muted hover:text-ink mr-3 mb-1"
  >
    처음부터 다시
  </button>
)}
```

- [ ] **Step 2: dev에서 동작 확인**

3턴 이상 대화 후 "처음부터 다시" 버튼 노출 + 클릭 시 초기화 확인. 에러 토스트 4초 후 사라지는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add components/Chat.tsx
git commit -m "feat: auto-dismiss errors and reset chat button"
```

---

## Task 18: 카카오톡 인앱 / 모바일 호환 점검 (수동)

**Files:** (점검만)

- [ ] **Step 1: 빌드 후 로컬 production 모드로 실행**

```bash
npm run build && npm run start
```

- [ ] **Step 2: 같은 네트워크의 모바일에서 접근**

PC IP 확인:
```bash
ipconfig getifaddr en0
```
모바일 사파리/크롬에서 `http://<PC-IP>:3000` 접속.

- [ ] **Step 3: 다음 항목 시각 점검**

체크리스트 (점검 결과는 PR description 또는 README에 메모):
- [ ] iPhone Safari: 폰트가 Pretendard로 렌더되는지
- [ ] iPhone Safari: 챗 메시지 스크롤 동작
- [ ] Android Chrome: 입력창 포커스 시 키보드 가림 처리
- [ ] 카카오톡 PC → 본인 PC URL 공유 → 카톡 인앱 브라우저에서 열기 → 폰트/스트리밍/localStorage 동작 확인
- [ ] 가로 모드에서도 깨지지 않음
- [ ] 다크 모드 시스템 설정에서도 (이 사이트는 라이트만 지원) 가독성 OK

- [ ] **Step 4: 발견된 이슈는 즉시 컴포넌트 수정 후 커밋**

(이슈 없으면 이 step 건너뜀.)

---

## Task 19: README + Vercel 배포 + 환경변수 가이드

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README 작성**

`README.md`를 다음으로 교체:

```markdown
# lazy-work

지수님에게 보낼 자기소개 페이지. 상단의 손편지 노트와 캐릭터 AI 챗봇으로 구성된 단일 페이지.

## 로컬 실행

\`\`\`bash
npm install
cp .env.local.example .env.local      # ANTHROPIC_API_KEY 채우기
npm run dev
\`\`\`
http://localhost:3000

## 테스트

\`\`\`bash
npm run test
\`\`\`

## 콘텐츠 수정

- `content/intro-note.md` — 첫인상 노트
- `content/bio.md` — 자기소개
- `content/persona.md` — AI 톤 가이드
- `content/qa.json` — Q&A 30개

수정 후 `npm run build`로 검증.

## 배포 (Vercel)

1. 이 레포를 Vercel에 import (Framework preset: Next.js, 그대로 두면 됨)
2. 환경변수 설정:
   - `ANTHROPIC_API_KEY` — Anthropic 콘솔에서 발급
3. (선택) Rate limit 영구화: Vercel Storage에서 KV 생성 → 자동으로 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 주입됨
4. 첫 배포 후 도메인을 공유

KV가 없으면 in-memory rate limit으로 동작 (Edge 함수 인스턴스마다 reset됨 — 소규모 사용에는 충분).
```

- [ ] **Step 2: 빌드 sanity 마지막 점검**

```bash
npm run build
npm run test
```
Expected: 빌드 + 모든 테스트 통과

- [ ] **Step 3: 커밋**

```bash
git add README.md
git commit -m "docs: README with local setup, content guide, and Vercel deploy"
```

- [ ] **Step 4: (수동) Vercel 배포**

Vercel 대시보드에서 import → 환경변수 등록 → Deploy. 배포 URL을 사용자에게 전달.

---

## 종료 조건 (Definition of Done)

- [ ] 모든 19 task의 step이 체크되어 있다
- [ ] `npm run build` 성공
- [ ] `npm run test` 모두 통과
- [ ] `content/qa.json`에 placeholder 1개가 아니라 실제 Q&A가 들어있다
- [ ] Vercel에 배포되어 public URL이 발급되었다
- [ ] 사용자(예환)가 직접 모바일/카톡 인앱에서 페이지를 한 바퀴 돌아보고 OK 했다
