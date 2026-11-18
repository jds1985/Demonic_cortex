const EMBERS = [
  { left: 8, delay: 0, duration: 14, size: 0.22 },
  { left: 27, delay: 3.2, duration: 16, size: 0.16 },
  { left: 54, delay: 1.4, duration: 15, size: 0.28 },
  { left: 78, delay: 4.6, duration: 13, size: 0.18 },
  { left: 92, delay: 2.1, duration: 17, size: 0.2 },
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
      </div>
    </div>
  );
}
