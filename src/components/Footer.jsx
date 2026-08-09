const COLUMNS = [
  {
    title: "Platform",
    links: ["Explore crafts", "How it works", "For pros", "Pricing"],
  },
  {
    title: "Support",
    links: ["Help centre", "Contact us", "Safety centre", "Trust & Verified"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Privacy policy"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-thread/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-9 h-9 rounded-full bg-gold text-ink font-display font-bold text-sm">
                Sv
              </span>
              <span className="font-display font-semibold text-lg text-canvas">
                SkillVerse
              </span>
            </div>
            <p className="text-sm text-thread/50 mt-4 max-w-xs leading-relaxed">
              The business platform for nail techs, barbers, makeup artists,
              lash techs, tailors, carpenters and every hand-skill pro.
            </p>
            <div className="flex gap-3 mt-6">
              {["Instagram", "TikTok", "X"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="w-9 h-9 rounded-full border border-thread/15 grid place-items-center text-thread/50 hover:text-gold-light hover:border-gold/40 transition-colors text-xs font-mono"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-xs uppercase tracking-widest text-thread/40 mb-4">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-thread/60 hover:text-canvas transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="seam mt-14 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-thread/40 font-mono">
          <p>© 2026 SkillVerse. All rights reserved.</p>
          <p>Made for makers, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}