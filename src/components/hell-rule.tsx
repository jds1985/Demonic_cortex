const LINKS = [28, 78, 128, 178, 228, 430, 480, 530, 580, 630];

export function HellRule() {
  return (
    <div className="hell-rule" aria-hidden="true">
      <svg viewBox="0 0 680 52" preserveAspectRatio="xMidYMid meet">
        <path d="M8 26 H250 M430 26 H672" stroke="#6a3a22" strokeWidth="3" />
        {LINKS.map((x) => (
          <ellipse key={x} cx={x} cy="26" rx="16" ry="10" fill="none" stroke="#a87848" strokeWidth="3" />
        ))}
        <path d="M310 26c8-18 22-18 30 0-8 18-22 18-30 0z" fill="#4a1014" stroke="#c4552a" strokeWidth="2" />
        <path d="M300 18c10-16 8-22-2-28 8 2 18 10 16 24" fill="none" stroke="#e07030" strokeWidth="2" />
        <path d="M380 18c-10-16-8-22 2-28-8 2-18 10-16 24" fill="none" stroke="#e07030" strokeWidth="2" />
        <path d="M328 30c6 10 18 10 24 0" fill="none" stroke="#7a1830" strokeWidth="2" />
        <circle cx="340" cy="26" r="3" fill="#ff6a2a" />
      </svg>
    </div>
  );
}
