"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsapPlugins";
import { useGSAP } from "@gsap/react";

const VOICES = [
  {
    quote:
      "I used to get clients from WhatsApp status alone. Now my SkillVerse portfolio does the convincing before they even message me.",
    name: "Chidinma A.",
    craft: "Nail Tech, Port Harcourt",
  },
  {
    quote:
      "Booking a tailor for my traditional wear used to mean three days of phone tag. I found one, saw his work, and booked in ten minutes.",
    name: "Emeka O.",
    craft: "Client",
  },
  {
    quote:
      "The dashboard shows me exactly which days I'm fully booked and which clients keep coming back. It runs like a real business now.",
    name: "Faith U.",
    craft: "Makeup Artist, Lagos",
  },
];

export default function Community() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.from(".voice-card", {
        scrollTrigger: { trigger: root.current, start: "top 78%" },
        y: 34,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.65,
        ease: "power3.out",
      });
      gsap.from(".community-copy > *", {
        scrollTrigger: { trigger: root.current, start: "top 78%" },
        y: 20,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    { scope: root }
  );

  return (
    <section id="community" ref={root} className="bg-canvas text-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-start">
          <div className="community-copy">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-clay mb-3">
              Join the guild
            </p>
            <h2 className="font-display font-semibold text-4xl sm:text-5xl text-balance">
              More than a booking app.{" "}
              <span className="text-emerald">A craft community.</span>
            </h2>
            <p className="text-ink/60 mt-5 max-w-sm">
              Pros share technique, clients share results, and everyone finds
              their next favourite hand to hire.
            </p>
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 bg-ink text-canvas font-semibold px-6 py-3.5 rounded-full mt-8 hover:bg-ink-soft transition-colors"
            >
              Explore the community
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {VOICES.map((v, i) => (
              <div
                key={v.name}
                className={`voice-card rounded-2xl border border-ink/10 p-6 bg-canvas-dim ${
                  i === 0 ? "sm:col-span-2" : ""
                }`}
              >
                <p className="text-ink/80 leading-relaxed">&ldquo;{v.quote}&rdquo;</p>
                <div className="flex items-center gap-3 mt-5">
                  <div className="w-9 h-9 rounded-full bg-emerald/80" />
                  <div>
                    <p className="text-sm font-semibold">{v.name}</p>
                    <p className="text-xs text-ink/50 font-mono">{v.craft}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}