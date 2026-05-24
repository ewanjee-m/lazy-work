'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroNote } from '@/components/IntroNote';
import { ChatStage } from '@/components/ChatStage';
import { Footer } from '@/components/Footer';
import { content } from '@/lib/content';

export default function Page() {
  const [noteDone, setNoteDone] = useState(false);

  return (
    <main className="min-h-dvh pb-24">
      <IntroNote markdown={content.introNote} onComplete={() => setNoteDone(true)} />
      <AnimatePresence>
        {noteDone && (
          <motion.div
            key="chat-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChatStage greeting="안녕하세요, 지수님. 뭐가 제일 궁금해요?" />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
