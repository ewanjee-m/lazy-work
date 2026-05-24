'use client';

import { motion } from 'framer-motion';

type Props = {
  markdown: string;
  onComplete?: () => void;
};

export function IntroNote({ markdown, onComplete }: Props) {
  const paragraphs = markdown
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !p.startsWith('('));

  const PRE_ROLL      = 0.35;
  const LABEL_IN      = 0.6;
  const CARD_IN       = 0.5;
  const PARA_DURATION = 1.3;
  const PARA_GAP      = 0.4;

  const labelStart    = PRE_ROLL;
  const cardStart     = labelStart + LABEL_IN * 0.5;
  const firstParaStart = labelStart + LABEL_IN + 0.3;
  const lastParaEnd   =
    firstParaStart + paragraphs.length * PARA_DURATION + (paragraphs.length - 1) * PARA_GAP;
  const signatureStart = lastParaEnd + 0.3;
  const completeAt    = signatureStart + 0.8;

  return (
    <section className="relative px-4 pt-16 md:pt-24 max-w-xl mx-auto">
      {/* Cinematic radial glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-96 mx-auto"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(163,177,138,0.3), rgba(163,177,138,0) 60%)',
          filter: 'blur(24px)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 1, 0.4], scale: [0.85, 1.05, 1] }}
        transition={{ duration: 2.2, times: [0, 0.55, 1], ease: 'easeOut', delay: PRE_ROLL }}
      />

      {/* Label above card */}
      <motion.div
        className="label relative px-1 mb-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: LABEL_IN, ease: 'easeOut', delay: labelStart }}
      >
        FIRST IMPRESSION · 지수
      </motion.div>

      {/* White card */}
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255, 254, 251, 0.88)',
          boxShadow: '0 2px 20px rgba(88,129,87,0.10), 0 1px 4px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: CARD_IN, ease: [0.22, 1, 0.36, 1], delay: cardStart }}
      >
        {/* Subtle top border accent */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(163,177,138,0.4) 40%, rgba(163,177,138,0.4) 60%, transparent)' }}
        />

        <div className="px-7 py-8">
          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                className="whitespace-pre-line text-[17px] md:text-[18px] leading-[1.75] tracking-tight"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  delay: firstParaStart + i * (PARA_DURATION + PARA_GAP),
                  duration: PARA_DURATION,
                  ease: [0.16, 1, 0.3, 1],
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
            className="mt-7 text-[var(--ink-muted)] text-sm tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: signatureStart, duration: 0.6 }}
          >
            ─ 예환
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
