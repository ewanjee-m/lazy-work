import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    // 30 calls span different minute windows (same day) so minute limit doesn't block.
    // Without advancing time, all calls share the same minute key and minute limit fires at call 7.
    vi.useFakeTimers();
    const start = new Date('2024-01-01T00:00:00Z');
    vi.setSystemTime(start);
    const store2 = makeMemoryStore();
    for (let i = 0; i < 30; i++) {
      const r = await checkRateLimit(store2, '2.2.2.2');
      expect(r.ok).toBe(true);
      vi.setSystemTime(new Date(start.getTime() + (i + 1) * 60_000));
    }
    expect(await checkRateLimit(store2, '2.2.2.2')).toEqual({
      ok: false,
      reason: 'day',
    });
    vi.useRealTimers();
  });

  it('IP 없으면 unknown 키로 처리', async () => {
    const r = await checkRateLimit(store, null);
    expect(r.ok).toBe(true);
  });
});
