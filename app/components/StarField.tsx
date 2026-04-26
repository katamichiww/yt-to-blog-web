'use client';

// Seeded pseudo-random so server + client render identical stars (no hydration mismatch)
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  gold: boolean;
  type: 'dot' | 'cross';
}

const STARS: Star[] = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: sr(i * 3) * 100,
  y: sr(i * 3 + 1) * 100,
  size: sr(i * 3 + 2) * 2.2 + 0.4,
  delay: sr(i * 7) * 6,
  duration: sr(i * 11) * 3 + 2.5,
  gold: i % 9 === 0,           // every 9th star is gold
  type: i % 25 === 0 ? 'cross' : 'dot',  // a few sparkle crosses
}));

export default function StarField() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {STARS.map((s) =>
        s.type === 'cross' ? (
          // Sparkle ✦ cross
          <span
            key={s.id}
            className="absolute select-none"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontSize: `${s.size * 5 + 6}px`,
              color: s.gold ? '#C9A84C' : 'rgba(255,255,255,0.7)',
              animation: `glow-pulse ${s.duration}s ${s.delay}s infinite`,
              lineHeight: 1,
            }}
          >
            ✦
          </span>
        ) : (
          // Regular dot star
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: s.gold ? '#C9A84C' : 'white',
              animation: `twinkle ${s.duration}s ${s.delay}s infinite, drift ${s.duration * 2.5}s ${s.delay}s infinite ease-in-out`,
              boxShadow: s.gold
                ? `0 0 ${s.size * 3}px rgba(201,168,76,0.6)`
                : `0 0 ${s.size * 2}px rgba(255,255,255,0.4)`,
            }}
          />
        )
      )}
    </div>
  );
}
