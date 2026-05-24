'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Expression } from '@/lib/expression-from-text';

type Props = { expression: Expression };

const SIZE = 120;

export function Character({ expression }: Props) {
  const [introBlink, setIntroBlink] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIntroBlink(false), 800);
    return () => clearTimeout(t);
  }, []);

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
          {/* face */}
          <circle cx="60" cy="60" r="50" fill="#fffdf9" stroke="#3a3d35" strokeWidth="1.5" />
          {/* rosy cheeks */}
          <circle cx="42" cy="66" r="5" fill="#f4b8b8" opacity="0.35" />
          <circle cx="78" cy="66" r="5" fill="#f4b8b8" opacity="0.35" />
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
    case 'smiling':
      return (
        <g>
          {/* happy ^^ crescent eyes */}
          <path d="M40,55 Q44,47 48,55 Z" fill="#3a3d35" />
          <path d="M72,55 Q76,47 80,55 Z" fill="#3a3d35" />
          {/* raised eyebrows */}
          <g stroke="#3a3d35" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity={0.4}>
            <path d="M39,45 Q44,42 49,45" />
            <path d="M71,45 Q76,42 81,45" />
          </g>
        </g>
      );
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
        <g>
          <g stroke="#3a3d35" strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M40,53 Q44,49 48,53" />
            <path d="M72,53 Q76,49 80,53" />
          </g>
          {/* subtle eyebrows */}
          <g stroke="#3a3d35" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity={0.4}>
            <path d="M39,47 Q44,44 49,47" />
            <path d="M71,47 Q76,44 81,47" />
          </g>
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
        <path d="M43,70 Q60,85 77,70" stroke="#3a3d35" strokeWidth="2.4" fill="none" strokeLinecap="round" />
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
        <path d="M46,72 Q60,79 74,72" stroke="#3a3d35" strokeWidth="2.1" fill="none" strokeLinecap="round" />
      );
  }
}
