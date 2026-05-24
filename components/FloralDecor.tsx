'use client';

import { motion } from 'framer-motion';

function Flower({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const ANGLES_DEG = [-90, -18, 54, 126, 198];
  const petalOffset = 9 * scale;
  const rx = 3.5 * scale;
  const ry = 7.5 * scale;

  return (
    <g>
      {ANGLES_DEG.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const px = x + petalOffset * Math.cos(rad);
        const py = y + petalOffset * Math.sin(rad);
        return (
          <ellipse
            key={deg}
            cx={px}
            cy={py}
            rx={rx}
            ry={ry}
            fill="rgba(255,253,250,0.9)"
            stroke="rgba(210,195,178,0.3)"
            strokeWidth={0.6}
            transform={`rotate(${deg + 90}, ${px}, ${py})`}
          />
        );
      })}
      <circle cx={x} cy={y} r={3.2 * scale} fill="#f0d080" opacity={0.9} />
      <circle cx={x} cy={y} r={1.6 * scale} fill="#d4a040" opacity={0.75} />
    </g>
  );
}

function Leaf({ x, y, rotate = 0, scale = 1 }: { x: number; y: number; rotate?: number; scale?: number }) {
  return (
    <path
      d={`M${x},${y} Q${x + 7 * scale},${y - 8 * scale} ${x},${y - 18 * scale} Q${x - 7 * scale},${y - 8 * scale} ${x},${y} Z`}
      fill="#a3b18a"
      transform={`rotate(${rotate}, ${x}, ${y})`}
    />
  );
}

function ScatteredFlower({ scale = 1 }: { scale?: number }) {
  const size = 40 * scale;
  const ANGLES_DEG = [-90, -18, 54, 126, 198];
  const cx = 20, cy = 20;
  const petalOffset = 9 * scale;
  const rx = 3.5 * scale;
  const ry = 7.5 * scale;

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {ANGLES_DEG.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const px = cx + petalOffset * Math.cos(rad);
        const py = cy + petalOffset * Math.sin(rad);
        return (
          <ellipse
            key={deg}
            cx={px}
            cy={py}
            rx={rx}
            ry={ry}
            fill="rgba(255,253,250,0.95)"
            stroke="rgba(200,185,165,0.5)"
            strokeWidth={0.7}
            transform={`rotate(${deg + 90}, ${px}, ${py})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={3.5 * scale} fill="#e8c040" opacity={0.95} />
      <circle cx={cx} cy={cy} r={1.8 * scale} fill="#c8900a" opacity={0.8} />
    </svg>
  );
}

function Sparkle({ size = 14 }: { size?: number }) {
  const h = size / 2;
  const r2 = h;
  const r1 = h * 0.35;
  const pts = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? r2 : r1;
    return `${h + r * Math.cos(angle)},${h + r * Math.sin(angle)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <polygon points={pts} fill="rgba(240,210,100,0.95)" />
      <polygon points={pts} fill="none" stroke="rgba(200,160,40,0.4)" strokeWidth="0.5" />
    </svg>
  );
}

const PETALS: { x: string; y: string; delay: number; duration: number; rotate: number }[] = [
  { x: '18%', y: '12%', delay: 0,   duration: 10, rotate: 15  },
  { x: '72%', y: '30%', delay: 2.5, duration: 12, rotate: -20 },
  { x: '8%',  y: '55%', delay: 4.5, duration: 11, rotate: 30  },
  { x: '82%', y: '65%', delay: 1.5, duration: 13, rotate: -10 },
  { x: '55%', y: '45%', delay: 3.2, duration: 9,  rotate: 22  },
  { x: '38%', y: '75%', delay: 5.0, duration: 14, rotate: -5  },
];

const FLOWERS: {
  left: string; top: string; delay: number; scale: number;
  floatY: number; floatDur: number; heartbeat?: boolean;
}[] = [
  { left: '5%',  top: '32%', delay: 1.0, scale: 0.55, floatY: 6, floatDur: 7.2 },
  { left: '88%', top: '22%', delay: 1.2, scale: 0.50, floatY: 8, floatDur: 8.5 },
  { left: '48%', top: '7%',  delay: 1.5, scale: 0.48, floatY: 5, floatDur: 6.8 },
  { left: '14%', top: '70%', delay: 0.8, scale: 0.52, floatY: 7, floatDur: 9.1 },
  { left: '76%', top: '58%', delay: 1.3, scale: 0.50, floatY: 6, floatDur: 7.7 },
  { left: '34%', top: '90%', delay: 1.1, scale: 0.45, floatY: 9, floatDur: 8.0 },
  { left: '62%', top: '40%', delay: 1.6, scale: 0.48, floatY: 7, floatDur: 8.3, heartbeat: true },
  { left: '25%', top: '50%', delay: 0.9, scale: 0.46, floatY: 6, floatDur: 7.5 },
  { left: '90%', top: '75%', delay: 1.4, scale: 0.43, floatY: 5, floatDur: 9.5, heartbeat: true },
  { left: '42%', top: '62%', delay: 1.7, scale: 0.45, floatY: 8, floatDur: 6.5 },
];

const SPARKLES: {
  left: string; top: string; delay: number; size: number;
  floatDur: number; heartbeat?: boolean;
}[] = [
  { left: '10%', top: '15%', delay: 0.8, size: 12, floatDur: 6.0, heartbeat: true },
  { left: '40%', top: '28%', delay: 1.5, size: 10, floatDur: 7.5 },
  { left: '70%', top: '10%', delay: 0.6, size: 13, floatDur: 5.8, heartbeat: true },
  { left: '55%', top: '55%', delay: 1.8, size: 10, floatDur: 8.2 },
  { left: '22%', top: '83%', delay: 1.2, size: 10, floatDur: 7.0 },
  { left: '85%', top: '42%', delay: 0.5, size: 12, floatDur: 6.5, heartbeat: true },
  { left: '30%', top: '18%', delay: 1.3, size: 11, floatDur: 9.0 },
  { left: '60%', top: '82%', delay: 1.0, size: 10, floatDur: 7.8 },
  { left: '50%', top: '38%', delay: 2.0, size: 9,  floatDur: 6.2, heartbeat: true },
  { left: '78%', top: '88%', delay: 0.7, size: 11, floatDur: 8.8 },
];

const HB_SCALE   = [1, 1.25, 0.92, 1.16, 1, 1, 1] as number[];
const HB_TIMES   = [0, 0.08, 0.18, 0.28, 0.38, 0.65, 1.0] as number[];
const HB_CONFIG  = { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const };

export function FloralDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      {/* Top-right branch cluster */}
      <motion.svg
        className="absolute -top-2 -right-2 w-36 md:w-52"
        viewBox="0 0 220 240"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2.8, ease: 'easeOut', delay: 0.5 }}
      >
        <path d="M210,10 Q190,50 165,85 Q140,120 115,170 Q100,195 90,225" stroke="#588157" strokeWidth="1.5" strokeLinecap="round" opacity={0.7} />
        <path d="M165,85 Q145,70 125,60" stroke="#588157" strokeWidth="1.1" strokeLinecap="round" opacity={0.6} />
        <Leaf x={190} y={40}  rotate={-40} scale={1.1} />
        <Leaf x={175} y={65}  rotate={25} />
        <Leaf x={150} y={105} rotate={-20} />
        <Leaf x={128} y={62}  rotate={-50} />
        <Leaf x={120} y={150} rotate={15}  scale={0.9} />
        <Leaf x={100} y={195} rotate={-10} scale={0.8} />
        <Flower x={205} y={20}  scale={1} />
        <Flower x={140} y={118} scale={0.85} />
      </motion.svg>

      {/* Bottom-left branch cluster */}
      <motion.svg
        className="absolute -bottom-2 -left-2 w-28 md:w-40"
        viewBox="0 0 160 200"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 2.8, ease: 'easeOut', delay: 1 }}
      >
        <path d="M20,190 Q40,150 60,115 Q80,80 95,45 Q105,25 115,10" stroke="#588157" strokeWidth="1.4" strokeLinecap="round" opacity={0.7} />
        <path d="M60,115 Q80,125 100,118" stroke="#588157" strokeWidth="1" strokeLinecap="round" opacity={0.6} />
        <Leaf x={40}  y={170} rotate={200} />
        <Leaf x={60}  y={130} rotate={160}  scale={1.1} />
        <Leaf x={78}  y={95}  rotate={-160} />
        <Leaf x={95}  y={55}  rotate={170}  scale={0.9} />
        <Leaf x={98}  y={125} rotate={-140} scale={0.85} />
        <Flower x={110} y={18} scale={0.9} />
        <Flower x={80}  y={78} scale={0.75} />
      </motion.svg>

      {/* Scattered flowers */}
      {FLOWERS.map((f, i) => (
        <motion.div
          key={`sf-${i}`}
          className="absolute pointer-events-none"
          style={{ left: f.left, top: f.top }}
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{
            opacity: 0.55,
            scale: f.heartbeat ? HB_SCALE : 1,
            y:      [0, -f.floatY, 0, f.floatY * 0.4, 0],
            rotate: [0, 4, 0, -4, 0],
          }}
          transition={{
            opacity: { duration: 1.8, ease: 'easeOut', delay: f.delay },
            scale:   f.heartbeat
              ? { ...HB_CONFIG, times: HB_TIMES, delay: f.delay + 0.5 }
              : { duration: 1.8, ease: 'easeOut', delay: f.delay },
            y:       { duration: f.floatDur, ease: 'easeInOut', delay: f.delay, repeat: Infinity, repeatType: 'loop' },
            rotate:  { duration: f.floatDur * 1.3, ease: 'easeInOut', delay: f.delay, repeat: Infinity, repeatType: 'loop' },
          }}
        >
          <ScatteredFlower scale={f.scale} />
        </motion.div>
      ))}

      {/* Sparkle stars */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={`sp-${i}`}
          className="absolute pointer-events-none"
          style={{ left: s.left, top: s.top }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: 0.6,
            scale:   s.heartbeat ? HB_SCALE : [0.85, 1.05, 0.85],
            y:       [0, -5, 0, 3, 0],
          }}
          transition={{
            opacity: { duration: 1.5, ease: 'easeOut', delay: s.delay },
            scale:   s.heartbeat
              ? { ...HB_CONFIG, times: HB_TIMES, delay: s.delay + 0.3 }
              : { duration: s.floatDur * 0.9, ease: 'easeInOut', delay: s.delay, repeat: Infinity, repeatType: 'loop' },
            y:       { duration: s.floatDur, ease: 'easeInOut', delay: s.delay, repeat: Infinity, repeatType: 'loop' },
          }}
        >
          <Sparkle size={s.size} />
        </motion.div>
      ))}

      {/* Floating petals */}
      {PETALS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-4 md:w-4 md:h-5"
          style={{ left: p.x, top: p.y }}
          initial={{ opacity: 0, y: 0, rotate: p.rotate }}
          animate={{
            opacity: [0, 0.45, 0.3, 0],
            y:      [-5, -25, -50, -75],
            rotate: [p.rotate, p.rotate + 20, p.rotate + 35],
          }}
          transition={{ duration: p.duration, delay: p.delay + 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 16 22" fill="none">
            <ellipse cx="8" cy="11" rx="5" ry="9" fill="rgba(255,252,248,0.88)" stroke="rgba(210,195,175,0.3)" strokeWidth="0.5" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
