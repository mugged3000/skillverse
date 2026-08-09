// The rotating "VERIFIED SKILL" seal badge, floating over the Hero
// visual column. Animated by Hero.jsx's GSAP timeline via the
// .hero-badge class, scoped to the Hero section.
export default function VerifiedBadge() {
  return (
    <div
      className="hero-badge absolute right-[2%] top-[32%] w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-canvas grid place-items-center shadow-xl"
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="#c1443c"
          strokeWidth="1.6"
          strokeDasharray="2.4 4.8"
        />
        <text
          x="32"
          y="30"
          textAnchor="middle"
          className="fill-ink"
          style={{ font: "700 8.5px var(--font-mono)" }}
        >
          VERIFIED
        </text>
        <text
          x="32"
          y="41"
          textAnchor="middle"
          className="fill-clay"
          style={{ font: "700 8.5px var(--font-mono)" }}
        >
          SKILL
        </text>
      </svg>
    </div>
  );
}