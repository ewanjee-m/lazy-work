'use client';

import { motion } from 'framer-motion';

type Props = {
  markdown: string;
  onComplete?: () => void;
};

export function IntroNote({ markdown, onComplete }: Props) {
  // Split by blank lines into paragraphs. Filter empty + placeholder lines starting with '('.
  const paragraphs = markdown
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !p.startsWith('('));

  // Timing: pre-roll → label → paragraphs → signature
  const PRE_ROLL = 0.35;          // empty bg moment
  const LABEL_IN = 0.6;           // label fade-in duration
  const PARA_DURATION = 1.3;      // each paragraph reveal
  const PARA_GAP = 0.4;           // pause between paragraphs

  const labelStart = PRE_ROLL;
  const firstParaStart = labelStart + LABEL_IN + 0.2;
  const lastParaEnd =
    firstParaStart + paragraphs.length * PARA_DURATION + (paragraphs.length - 1) * PARA_GAP;
  const signatureStart = lastParaEnd + 0.3;
  const completeAt = signatureStart + 0.8;

  return (
    <section className="relative px-6 pt-20 md:pt-28 max-w-xl mx-auto">
      {/* Cinematic radial glow — fades in then settles */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-96 mx-auto"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(163,177,138,0.35), rgba(163,177,138,0) 60%)',
          filter: 'blur(20px)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 1, 0.45], scale: [0.85, 1.05, 1] }}
        transition={{
          duration: 2.2,
          times: [0, 0.55, 1],
          ease: 'easeOut',
          delay: PRE_ROLL,
        }}
      />

      <motion.div
        className="label relative"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: LABEL_IN, ease: 'easeOut', delay: labelStart }}
      >
        FIRST IMPRESSION · 지수
      </motion.div>

      <div className="mt-7 space-y-6 relative">
        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            className="whitespace-pre-line text-[17px] md:text-[19px] leading-[1.7] tracking-tight"
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              delay: firstParaStart + i * (PARA_DURATION + PARA_GAP),
              duration: PARA_DURATION,
              ease: [0.16, 1, 0.3, 1], // easeOutExpo — gentle settle
            }}
            onAnimationComplete={() => {
              if (i === paragraphs.length - 1) {
                setTimeout(() => onComplete?.(), (completeAt - lastParaEnd) * 1000);
              }
            }}
          >
            {p}
          </motion.p>
        ))}
      </div>

      <motion.div
        className="mt-8 text-ink-muted text-sm tracking-wide relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: signatureStart, duration: 0.6 }}
      >
        ─ 예환
      </motion.div>
    </section>
  );
}
