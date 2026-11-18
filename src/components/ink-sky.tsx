export function InkSky() {
  return (
    <div className="ink-sky" aria-hidden="true">
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" focusable="false">
        <rect width="300" height="400" fill="#14080b" />
        <rect y="150" width="300" height="90" fill="#6e1420" />
        <rect y="230" width="300" height="80" fill="#3c0c14" />
        <rect y="300" width="300" height="100" fill="#100608" />
        <path
          d="M18 176c30-40 66-24 82 6c20-44 74-38 96 8c24-20 52-8 74 16H16z"
          fill="#0c0607"
          stroke="#f0d48a"
          strokeWidth="6"
        />
        <circle cx="214" cy="78" r="28" fill="#c4473a" stroke="#f0d48a" strokeWidth="6" />
        <circle cx="48" cy="118" r="4" fill="#f0d48a" />
        <circle cx="92" cy="62" r="3" fill="#e7b8a4" />
        <circle cx="250" cy="146" r="3" fill="#f0d48a" />
        <rect x="12" y="12" width="276" height="376" fill="none" stroke="#f0d48a" strokeWidth="8" />
      </svg>
    </div>
  );
}
