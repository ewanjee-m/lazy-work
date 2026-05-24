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
