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

const PETALS: { x: string; y: string; delay: number; duration: number; rotate: number }[] = [
  { x: '18%', y: '12%', delay: 0, duration: 10, rotate: 15 },
  { x: '72%', y: '30%', delay: 2.5, duration: 12, rotate: -20 },
  { x: '8%',  y: '55%', delay: 4.5, duration: 11, rotate: 30 },
  { x: '82%', y: '65%', delay: 1.5, duration: 13, rotate: -10 },
];

export function FloralDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Top-right branch cluster */}
      <motion.svg
        className="absolute -top-2 -right-2 w-36 md:w-52"
        viewBox="0 0 220 240"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ duration: 2.8, ease: 'easeOut', delay: 0.5 }}
      >
        <path
          d="M210,10 Q190,50 165,85 Q140,120 115,170 Q100,195 90,225"
          stroke="#588157"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M165,85 Q145,70 125,60"
          stroke="#588157"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity={0.6}
        />
        <Leaf x={190} y={40} rotate={-40} scale={1.1} />
        <Leaf x={175} y={65} rotate={25} />
        <Leaf x={150} y={105} rotate={-20} />
        <Leaf x={128} y={62} rotate={-50} />
        <Leaf x={120} y={150} rotate={15} scale={0.9} />
        <Leaf x={100} y={195} rotate={-10} scale={0.8} />
        <Flower x={205} y={20} scale={1} />
        <Flower x={140} y={118} scale={0.85} />
      </motion.svg>

      {/* Bottom-left branch cluster */}
      <motion.svg
        className="absolute -bottom-2 -left-2 w-28 md:w-40"
        viewBox="0 0 160 200"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2.8, ease: 'easeOut', delay: 1 }}
      >
        <path
          d="M20,190 Q40,150 60,115 Q80,80 95,45 Q105,25 115,10"
          stroke="#588157"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M60,115 Q80,125 100,118"
          stroke="#588157"
          strokeWidth="1"
          strokeLinecap="round"
          opacity={0.6}
        />
        <Leaf x={40} y={170} rotate={200} />
        <Leaf x={60} y={130} rotate={160} scale={1.1} />
        <Leaf x={78} y={95} rotate={-160} />
        <Leaf x={95} y={55} rotate={170} scale={0.9} />
        <Leaf x={98} y={125} rotate={-140} scale={0.85} />
        <Flower x={110} y={18} scale={0.9} />
        <Flower x={80} y={78} scale={0.75} />
      </motion.svg>

      {/* Floating petals — warm white */}
      {PETALS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-4 md:w-4 md:h-5"
          style={{ left: p.x, top: p.y }}
          initial={{ opacity: 0, y: 0, rotate: p.rotate }}
          animate={{
            opacity: [0, 0.35, 0.25, 0],
            y: [-5, -25, -50, -75],
            rotate: [p.rotate, p.rotate + 20, p.rotate + 35],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay + 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 16 22" fill="none">
            <ellipse
              cx="8"
              cy="11"
              rx="5"
              ry="9"
              fill="rgba(255,252,248,0.88)"
              stroke="rgba(210,195,175,0.3)"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
