const EMBERS = [
  { left: 4, delay: 0, duration: 13 },
  { left: 12, delay: 2.2, duration: 16 },
  { left: 21, delay: 4.1, duration: 12 },
  { left: 33, delay: 1.1, duration: 15 },
  { left: 44, delay: 5.4, duration: 14 },
  { left: 53, delay: 0.6, duration: 17 },
  { left: 62, delay: 3.3, duration: 13 },
  { left: 71, delay: 6.2, duration: 15 },
  { left: 79, delay: 1.8, duration: 12 },
  { left: 88, delay: 4.7, duration: 16 },
  { left: 95, delay: 2.8, duration: 14 },
];

export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-glow" />
      <div className="embers">
        {EMBERS.map((ember) => (
          <span
            key={ember.left}
            className="ember"
            style={{
              left: `${ember.left}%`,
              animationDelay: `${ember.delay}s`,
              animationDuration: `${ember.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
