'use client';

import { useState } from 'react';
import { Chat } from '@/components/Chat';
import type { Expression } from '@/lib/expression-from-text';

export default function Page() {
  const [, setExpr] = useState<Expression>('idle');
  return (
    <main className="min-h-screen p-4 max-w-xl mx-auto">
      <Chat greeting="안녕하세요, 지수님. 뭐가 제일 궁금해요?" onExpressionChange={setExpr} />
    </main>
  );
}
