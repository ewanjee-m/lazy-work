'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Expression } from '@/lib/expression-from-text';

type Props = { expression: Expression };

const SIZE = 120;

export function Character({ expression }: Props) {
  const [introBlink, setIntroBlink] = useState(true);

  // First-mount slow blink: open → closed → open over 800ms
  useEffect(() => {
    const t = setTimeout(() => setIntroBlink(false), 800);
    return () => clearTimeout(t);
  }, []);

  // During the intro blink we override eyes to 'thinking' (closed) shape briefly
  const displayedExpression: Expression = introBlink ? 'thinking' : expression;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <motion.div
        style={{ width: SIZE, height: SIZE }}
        className="relative"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          scale: { type: 'spring', stiffness: 180, damping: 14 },
          opacity: { duration: 0.4, ease: 'easeOut' },
        }}
      >
        <svg viewBox="0 0 120 120" width={SIZE} height={SIZE}>
          <circle cx="60" cy="60" r="50" fill="#ffffff" stroke="#3a3d35" strokeWidth="2" />
          <circle cx="42" cy="64" r="3.2" fill="#a3b18a" opacity="0.4" />
          <circle cx="78" cy="64" r="3.2" fill="#a3b18a" opacity="0.4" />
          <AnimatePresence mode="wait">
            <motion.g
              key={displayedExpression}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Eyes expression={displayedExpression} />
              <Mouth expression={displayedExpression} />
            </motion.g>
          </AnimatePresence>
        </svg>
      </motion.div>
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
      return (
        <path d="M55,73 Q60,73 65,73" stroke="#3a3d35" strokeWidth="2" fill="none" strokeLinecap="round" />
      );
    case 'talking':
      return <ellipse cx="60" cy="74" rx="7" ry="4" fill="#3a3d35" />;
    case 'smiling':
      return (
        <path d="M46,71 Q60,80 74,71" stroke="#3a3d35" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      );
    case 'serious':
      return (
        <path d="M50,75 L70,75" stroke="#3a3d35" strokeWidth="2" fill="none" strokeLinecap="round" />
      );
    case 'blank':
      return (
        <path d="M50,75 L70,75" stroke="#3a3d35" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      );
    case 'idle':
    default:
      return (
        <path d="M48,72 Q60,77 72,72" stroke="#3a3d35" strokeWidth="2" fill="none" strokeLinecap="round" />
      );
  }
}
