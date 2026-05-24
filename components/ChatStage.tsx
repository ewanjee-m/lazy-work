'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Character } from './Character';
import { Chat } from './Chat';
import type { Expression } from '@/lib/expression-from-text';

type Props = { greeting: string };

export function ChatStage({ greeting }: Props) {
  const [expression, setExpression] = useState<Expression>('idle');

  return (
    <motion.section
      className="mt-12 md:mt-16 mx-auto max-w-2xl px-4"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-surface rounded-2xl shadow-[var(--shadow-soft)] overflow-hidden flex flex-col md:flex-row">
        {/* Character panel */}
        <div className="flex items-center justify-center py-6 md:py-0 md:w-44 shrink-0 md:border-r border-[#e5e0d4] bg-[#f6f3eb]">
          <Character expression={expression} />
        </div>
        {/* Chat panel */}
        <Chat greeting={greeting} onExpressionChange={setExpression} />
      </div>
    </motion.section>
  );
}
