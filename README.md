# lazy-work

지수님에게 보낼 자기소개 페이지. 상단의 손편지 노트와 캐릭터 AI 챗봇으로 구성된 단일 페이지.

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local      # ANTHROPIC_API_KEY 채우기
npm run dev
```
http://localhost:3000

## 테스트

```bash
npm run test
```

## 콘텐츠 수정

- `content/intro-note.md` — 첫인상 노트
- `content/bio.md` — 자기소개
- `content/persona.md` — AI 톤 가이드
- `content/qa.json` — Q&A 목록

수정 후 `npm run build`로 검증.

## 배포 (Vercel)

1. 이 레포를 Vercel에 import (Framework preset: Next.js, 그대로 두면 됨)
2. 환경변수 설정:
   - `ANTHROPIC_API_KEY` — Anthropic 콘솔에서 발급
3. (선택) Rate limit 영구화: Vercel Storage에서 KV 생성 → 자동으로 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 주입됨
4. 첫 배포 후 도메인을 공유

KV가 없으면 in-memory rate limit으로 동작 (Edge 함수 인스턴스마다 reset됨 — 소규모 사용에는 충분).
