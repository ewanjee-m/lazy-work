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
    <div className="flex flex-col flex-1 min-h-[320px]">
      <div className="flex-1 flex flex-col gap-3 px-4 py-4 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[15px] leading-relaxed ${
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
          className="flex-1 px-3 py-2 rounded-xl border border-[#e5e0d4] bg-white focus:outline-none focus:border-sage transition-colors"
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
          className="px-4 py-2 rounded-xl bg-sage text-white disabled:opacity-40 transition-opacity"
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
