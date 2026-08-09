"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapPlugins";
import { useGSAP } from "@gsap/react";
import { CRAFTS } from "@/lib/crafts";
import { CRAFT_ICONS } from "@/components/icons/CraftIcons";

const TINTS = [
  "bg-emerald border-emerald-light/30 text-canvas",
  "bg-gold border-gold-light/40 text-ink",
  "bg-clay border-clay-light/30 text-canvas",
  "bg-ink-soft border-thread/15 text-canvas",
];

export default function CraftGrid() {
  const root = useRef(null);
  const cardRefs = useRef([]);
  const iconRefs = useRef([]);
  const arrowRefs = useRef([]);

  useGSAP(
    () => {
      // Each card gets its own trigger (rather than one trigger for the
      // whole grid) so the second row still animates in as it's
      // scrolled to, instead of firing all at once with the first row.
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
          },
          y: 46,
          scale: 0.96,
          autoAlpha: 0,
          duration: 0.8,
          delay: (i % 4) * 0.06,
          ease: "power3.out",
        });
      });

      // If the page loads (or a client-side nav lands) already scrolled
      // to this section — e.g. a direct "#crafts" link — the loader's
      // scroll-lock can leave ScrollTrigger's math stale from before
      // the lock lifted. Refresh once loading actually finishes so the
      // reveal still fires correctly instead of sitting static.
      const onReady = () => ScrollTrigger.refresh();
      window.addEventListener("skillverse:ready", onReady);
      return () => window.removeEventListener("skillverse:ready", onReady);
    },
    { scope: root }
  );

  // Smooth GSAP-driven hover — lift + icon nudge + arrow slide, instead
  // of relying on plain CSS transitions.
  const handleEnter = (i) => {
    gsap.to(cardRefs.current[i], { y: -8, duration: 0.45, ease: "power3.out" });
    gsap.to(iconRefs.current[i], {
      scale: 1.12,
      rotate: -6,
      duration: 0.45,
      ease: "back.out(2)",
    });
    gsap.to(arrowRefs.current[i], {
      autoAlpha: 1,
      x: 0,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleLeave = (i) => {
    gsap.to(cardRefs.current[i], { y: 0, duration: 0.5, ease: "power3.out" });
    gsap.to(iconRefs.current[i], {
      scale: 1,
      rotate: 0,
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(arrowRefs.current[i], {
      autoAlpha: 0,
      x: -6,
      duration: 0.3,
      ease: "power2.in",
    });
  };

  return (
    <section id="crafts" ref={root} className="bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-light mb-3">
              Every craft, one guild
            </p>
            <h2 className="font-display font-semibold text-4xl sm:text-5xl text-canvas text-balance max-w-xl">
              Whatever the hand skill, it&rsquo;s on SkillVerse.
            </h2>
          </div>
          <p className="text-thread/60 max-w-sm">
            From acrylics to alterations — browse verified pros by craft,
            compare portfolios, and book in a few taps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CRAFTS.map((c, i) => {
            const Icon = CRAFT_ICONS[c.key];
            const tint = TINTS[i % TINTS.length];
            return (
              <a
                key={c.key}
                href="#waitlist"
                ref={(el) => (cardRefs.current[i] = el)}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={() => handleLeave(i)}
                className={
                  "craft-card group relative rounded-[1.4rem] border p-6 flex flex-col justify-between min-h-[220px] " +
                  tint
                }
              >
                <div className="flex items-start justify-between">
                  <Icon ref={(el) => (iconRefs.current[i] = el)} className="w-9 h-9" />
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">
                    {c.tag}
                  </span>
                </div>
                <div>
                  <p className="font-display font-semibold text-lg">{c.name}</p>
                  <p className="text-sm opacity-70 mt-1">{c.blurb}</p>
                  <p className="font-mono text-xs opacity-60 mt-4">
                    {c.pros} pros
                  </p>
                </div>
                <span
                  ref={(el) => (arrowRefs.current[i] = el)}
                  className="absolute top-6 right-6 opacity-0"
                  style={{ transform: "translateX(-6px)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 12 12 4M6 4h6v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}