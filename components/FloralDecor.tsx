'use client';

import { motion } from 'framer-motion';

function Flower({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const r = 5 * scale;
  const offset = 8 * scale;
  const angles = [-90, -18, 54, 126, 198].map((d) => (d * Math.PI) / 180);
  return (
    <g>
      {angles.map((a, i) => (
        <circle
          key={i}
          cx={x + offset * Math.cos(a)}
          cy={y + offset * Math.sin(a)}
          r={r}
          fill="#a3b18a"
        />
      ))}
      <circle cx={x} cy={y} r={3 * scale} fill="#588157" />
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
  { x: '20%', y: '15%', delay: 0, duration: 9, rotate: 15 },
  { x: '75%', y: '35%', delay: 2, duration: 11, rotate: -20 },
  { x: '10%', y: '60%', delay: 4, duration: 10, rotate: 30 },
  { x: '85%', y: '70%', delay: 1, duration: 12, rotate: -10 },
];

export function FloralDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Top-right branch cluster */}
      <motion.svg
        className="absolute -top-2 -right-2 w-36 md:w-52 opacity-30"
        viewBox="0 0 220 240"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2.5, ease: 'easeOut', delay: 0.5 }}
      >
        {/* main branch */}
        <path
          d="M210,10 Q190,50 165,85 Q140,120 115,170 Q100,195 90,225"
          stroke="#588157"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* side branch */}
        <path
          d="M165,85 Q145,70 125,60"
          stroke="#588157"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* leaves */}
        <Leaf x={190} y={40} rotate={-40} scale={1.1} />
        <Leaf x={175} y={65} rotate={25} />
        <Leaf x={150} y={105} rotate={-20} />
        <Leaf x={128} y={62} rotate={-50} />
        <Leaf x={120} y={150} rotate={15} scale={0.9} />
        <Leaf x={100} y={195} rotate={-10} scale={0.8} />
        {/* flowers */}
        <Flower x={205} y={20} scale={1} />
        <Flower x={140} y={118} scale={0.85} />
      </motion.svg>

      {/* Bottom-left branch cluster */}
      <motion.svg
        className="absolute -bottom-2 -left-2 w-28 md:w-40 opacity-25"
        viewBox="0 0 160 200"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 2.5, ease: 'easeOut', delay: 1 }}
      >
        {/* main branch */}
        <path
          d="M20,190 Q40,150 60,115 Q80,80 95,45 Q105,25 115,10"
          stroke="#588157"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* side branch */}
        <path
          d="M60,115 Q80,125 100,118"
          stroke="#588157"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        {/* leaves */}
        <Leaf x={40} y={170} rotate={200} />
        <Leaf x={60} y={130} rotate={160} scale={1.1} />
        <Leaf x={78} y={95} rotate={-160} />
        <Leaf x={95} y={55} rotate={170} scale={0.9} />
        <Leaf x={98} y={125} rotate={-140} scale={0.85} />
        {/* flower */}
        <Flower x={110} y={18} scale={0.9} />
        <Flower x={80} y={78} scale={0.75} />
      </motion.svg>

      {/* Floating individual petals */}
      {PETALS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 md:w-4 md:h-4"
          style={{ left: p.x, top: p.y }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.2, 0.15, 0], y: [-10, -30, -50, -70] }}
          transition={{
            duration: p.duration,
            delay: p.delay + 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 20 20" fill="none">
            <ellipse cx="10" cy="10" rx="5" ry="8" fill="#a3b18a" transform={`rotate(${p.rotate}, 10, 10)`} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
