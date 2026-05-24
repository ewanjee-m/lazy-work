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
