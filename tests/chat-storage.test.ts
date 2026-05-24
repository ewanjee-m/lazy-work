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
