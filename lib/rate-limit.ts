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
