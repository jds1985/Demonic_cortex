const EMBERS = [
  { left: 4, delay: 0, duration: 9, size: 0.28 },
  { left: 9, delay: 1.4, duration: 12, size: 0.18 },
  { left: 15, delay: 3.1, duration: 8, size: 0.4 },
  { left: 22, delay: 0.6, duration: 11, size: 0.22 },
  { left: 28, delay: 4.2, duration: 10, size: 0.34 },
  { left: 36, delay: 2.2, duration: 13, size: 0.16 },
  { left: 43, delay: 5.1, duration: 9, size: 0.46 },
  { left: 51, delay: 1.1, duration: 12, size: 0.24 },
  { left: 58, delay: 3.6, duration: 8, size: 0.32 },
  { left: 66, delay: 0.4, duration: 14, size: 0.2 },
  { left: 73, delay: 2.8, duration: 10, size: 0.42 },
  { left: 81, delay: 4.8, duration: 9, size: 0.18 },
  { left: 88, delay: 1.7, duration: 11, size: 0.36 },
  { left: 94, delay: 3.3, duration: 8, size: 0.26 },
];

const ASH = [
  { left: 7, delay: 0, duration: 18 },
  { left: 19, delay: 4, duration: 22 },
  { left: 33, delay: 1, duration: 16 },
  { left: 47, delay: 6, duration: 20 },
  { left: 61, delay: 2, duration: 19 },
  { left: 74, delay: 5, duration: 17 },
  { left: 86, delay: 3, duration: 21 },
  { left: 96, delay: 7, duration: 18 },
];

export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-glow" />
      <svg className="cracks" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <path d="M20 40 L70 120 L40 180 L110 260 L80 340" fill="none" stroke="#3a100c" strokeWidth="2" />
        <path d="M360 20 L300 90 L340 170 L280 240 L320 360" fill="none" stroke="#4a140e" strokeWidth="2" />
        <path d="M10 520 L80 580 L40 660 L120 740" fill="none" stroke="#2a0c0a" strokeWidth="2" />
        <path d="M390 500 L330 590 L360 680 L290 760" fill="none" stroke="#3a100c" strokeWidth="2" />
        <path d="M40 700c20-30 10-20 28-48 8 18 4 10 18-8" fill="#3a0a10" opacity="0.7" />
        <path d="M350 80c-16 24-8 16-22 36 10-6 6-4 14 10" fill="#4a1020" opacity="0.65" />
      </svg>
      <div className="smoke smoke-a" />
      <div className="smoke smoke-b" />
      <div className="embers">
        {EMBERS.map((ember) => (
          <span
            key={ember.left}
            className="ember"
            style={{
              left: `${ember.left}%`,
              width: `${ember.size}rem`,
              height: `${ember.size}rem`,
              animationDelay: `${ember.delay}s`,
              animationDuration: `${ember.duration}s`,
            }}
          />
        ))}
        {ASH.map((flake) => (
          <span
            key={`ash-${flake.left}`}
            className="ash"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
