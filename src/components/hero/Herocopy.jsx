import { HERO_STATS } from "@/lib/heroData";

// The left copy column: eyebrow, headline, subhead, CTAs, and the
// stat counters. Hero.jsx owns the GSAP timeline (targets these by
// .hero-eyebrow/.hero-line/.hero-sub/.hero-cta/.hero-stat classes) and
// the stat count-up animation (writes into statRefs), so `statRefs` is
// passed in rather than duplicated here.
export default function HeroCopy({ statRefs }) {
  return (
    <div>
      <span className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-mono uppercase tracking-[0.18em] text-gold-light">
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        Verified hands, ready to book
      </span>

      <h1 className="font-display font-semibold text-[13vw] leading-[0.95] tracking-tight text-canvas mt-6 sm:text-6xl lg:text-[4.6rem] lg:leading-[0.98]">
        <span className="block overflow-hidden">
          <span className="hero-line block">Find hands</span>
        </span>
        <span className="block overflow-hidden">
          <span className="hero-line block">you can</span>
        </span>
        <span className="block overflow-hidden">
          <span className="hero-line block text-gold">trust.</span>
        </span>
      </h1>

      <p className="hero-sub text-balance text-lg text-thread/70 mt-6 max-w-md">
        SkillVerse is where nail techs, barbers, makeup artists, tailors,
        carpenters and every hand-skill pro get discovered — and where
        clients book real craft, not guesswork.
      </p>

      <div className="flex flex-wrap items-center gap-4 mt-8">
        <a
          href="#waitlist"
          className="hero-cta inline-flex items-center gap-2 bg-gold text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-gold-light transition-colors"
        >
          Book a service
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <a
          href="#pros"
          className="hero-cta inline-flex items-center gap-2 border border-thread/25 text-canvas font-semibold px-6 py-3.5 rounded-full hover:border-gold/50 hover:text-gold-light transition-colors"
        >
          Become a pro
        </a>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 max-w-xl">
        {HERO_STATS.map((s, i) => (
          <div key={s.label} className="hero-stat">
            <dt className="sr-only">{s.label}</dt>
            <dd
              ref={(el) => (statRefs.current[i] = el)}
              className="font-mono text-2xl sm:text-3xl text-gold-light"
            >
              0
            </dd>
            <dd className="text-xs text-thread/50 mt-1">{s.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}