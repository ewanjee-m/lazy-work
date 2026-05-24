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
