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
