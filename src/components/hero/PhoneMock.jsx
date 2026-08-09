import { HERO_PHONE_FILTERS, HERO_PHONE_TOP_RATED } from "@/lib/heroData";

// The app-screen phone mockup in the Hero visual column. Pure markup —
// animated by Hero.jsx's GSAP timeline via .hero-phone / .hero-phone-item
// class selectors scoped to the Hero section, so this split doesn't
// change how or when anything animates.
export default function PhoneMock() {
  return (
    <div className="hero-phone absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[234px] sm:w-[268px]">
      <div className="relative">
        {/* side buttons */}
        <div aria-hidden className="absolute -left-[3px] top-[86px] w-[3px] h-8 rounded-l bg-ink-soft/90" />
        <div aria-hidden className="absolute -left-[3px] top-[124px] w-[3px] h-12 rounded-l bg-ink-soft/90" />
        <div aria-hidden className="absolute -right-[3px] top-[104px] w-[3px] h-14 rounded-r bg-ink-soft/90" />

        <div className="rounded-[2.6rem] border-[7px] border-ink-soft bg-ink-soft shadow-[0_40px_80px_-25px_rgba(0,0,0,0.65)] overflow-hidden">
          <div className="relative rounded-[2rem] overflow-hidden bg-canvas flex flex-col min-h-[520px] sm:min-h-[588px]">
            {/* camera notch / dynamic island */}
            <div
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 top-2.5 w-20 h-5 rounded-full bg-ink z-20"
            />

            {/* status bar */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-3 text-[10px] font-mono text-ink/50">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                  <rect x="0" y="6" width="2.4" height="4" rx="0.5" fill="currentColor" />
                  <rect x="3.6" y="4" width="2.4" height="6" rx="0.5" fill="currentColor" />
                  <rect x="7.2" y="2" width="2.4" height="8" rx="0.5" fill="currentColor" />
                  <rect x="10.8" y="0" width="2.4" height="10" rx="0.5" fill="currentColor" />
                </svg>
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
                  <path
                    d="M1 4a8.6 8.6 0 0 1 12 0M3.2 6.2a5.4 5.4 0 0 1 7.6 0M5.6 8.3a2.4 2.4 0 0 1 2.8 0"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="w-5 h-2.5 rounded-[2px] border border-current relative">
                  <div className="absolute inset-[1.5px] right-[2.5px] bg-current rounded-[1px]" />
                </div>
              </div>
            </div>

            <div className="px-4 pt-4 pb-3">
              <p className="hero-phone-item font-display font-semibold text-ink text-sm">
                Hello, Ada 👋
              </p>
              <p className="hero-phone-item text-[11px] text-ink/50 mt-0.5">
                What craft are you booking today?
              </p>
              <div className="hero-phone-item h-8 rounded-full bg-ink/5 border border-ink/10 mt-3 flex items-center px-3">
                <span className="text-[10px] text-ink/40">Search pros near you</span>
              </div>
              <div className="flex gap-2 mt-3">
                {HERO_PHONE_FILTERS.map((t, i) => (
                  <span
                    key={t}
                    className={
                      "hero-phone-item text-[9px] px-2.5 py-1 rounded-full font-mono " +
                      (i === 0 ? "bg-gold text-ink" : "bg-ink/5 text-ink/50")
                    }
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* promo banner — fills the extra height from stretching
                the phone with a natural bit of content */}
            <div className="px-4">
              <div className="hero-phone-item rounded-xl bg-gold/15 border border-gold/30 px-3 py-2.5 flex items-center gap-2">
                <span className="text-sm leading-none">✨</span>
                <p className="text-[9.5px] text-ink/70 leading-snug">
                  New: lash artists now on SkillVerse — 15% off your first
                  booking.
                </p>
              </div>
            </div>

            <div className="bg-ink-soft px-4 pt-4 pb-5 mt-3 space-y-2.5 flex-1">
              <p className="hero-phone-item text-[10px] font-mono text-thread/40 uppercase tracking-wider">
                Top rated near you
              </p>
              {HERO_PHONE_TOP_RATED.map((p) => (
                <div
                  key={p.n}
                  className="hero-phone-item flex items-center gap-2.5 bg-ink rounded-xl p-2.5 border border-thread/10"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-canvas font-medium truncate">{p.n}</p>
                    <p className="text-[9px] text-thread/40">{p.l}</p>
                  </div>
                  <span className="text-[9px] font-mono text-gold-light">★ {p.r}</span>
                </div>
              ))}
            </div>

            {/* subtle screen glare */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 28%)",
              }}
            />
          </div>
        </div>

        {/* home indicator */}
        <div
          aria-hidden
          className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-ink/70"
        />
      </div>
    </div>
  );
}