"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsapPlugins";
import { useGSAP } from "@gsap/react";

const FEATURES = [
  {
    title: "Discover",
    body: "Search by craft, style, location or price and find pros with real portfolios.",
  },
  {
    title: "Book",
    body: "Pick a slot, pay a deposit, done. No back-and-forth DMs to lock a booking.",
  },
  {
    title: "Showcase",
    body: "Pros build a living portfolio — before/afters, price lists, and reviews.",
  },
  {
    title: "Chat",
    body: "Confirm details, share reference photos, and reschedule in one thread.",
  },
  {
    title: "Save",
    body: "Bookmark favourite pros and styles to revisit before your next booking.",
  },
  {
    title: "Grow",
    body: "Pros track bookings, repeat clients and earnings from one dashboard.",
  },
];

export default function Features() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: root.current, start: "top 78%" },
        y: 36,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: "power3.out",
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="bg-canvas text-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald mb-3">
          Built with the makers
        </p>
        <h2 className="font-display font-semibold text-4xl sm:text-5xl text-balance max-w-2xl">
          More than bookings. A full business toolkit for hand-skill pros.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink/10 mt-14 rounded-2xl overflow-hidden">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="feature-card bg-canvas p-8 hover:bg-canvas-dim transition-colors"
            >
              <span className="font-mono text-xs text-clay">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display font-semibold text-xl mt-4">
                {f.title}
              </h3>
              <p className="text-ink/60 mt-2 text-sm leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}