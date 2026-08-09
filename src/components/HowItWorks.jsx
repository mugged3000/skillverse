"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsapPlugins";
import { useGSAP } from "@gsap/react";

const STEPS = {
  client: [
    {
      title: "Search your craft",
      body: "Tell us what you need — box braids, gel-X, a fitted agbada — and where.",
    },
    {
      title: "Compare & choose",
      body: "Browse portfolios, prices and reviews, then message or book instantly.",
    },
    {
      title: "Get it done",
      body: "Show up, get your look, and leave a review that helps the next client.",
    },
  ],
  pro: [
    {
      title: "Build your profile",
      body: "Add your portfolio, price list, availability and the crafts you offer.",
    },
    {
      title: "Get discovered",
      body: "Show up in search across your city, categories, and craft tags.",
    },
    {
      title: "Manage & earn",
      body: "Track bookings, chat with clients and get paid — all in one place.",
    },
  ],
};

export default function HowItWorks() {
  const root = useRef(null);
  const [tab, setTab] = useState("client");

  useGSAP(
    () => {
      gsap.from(".step-card", {
        scrollTrigger: { trigger: root.current, start: "top 75%" },
        y: 30,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    { scope: root, dependencies: [tab] }
  );

  const steps = STEPS[tab];

  return (
    <section id="how-it-works" ref={root} className="bg-ink py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-light mb-3">
              How it works
            </p>
            <h2 className="font-display font-semibold text-4xl sm:text-5xl text-canvas text-balance max-w-xl">
              Three steps, either side of the booking.
            </h2>
          </div>

          <div className="inline-flex rounded-full border border-thread/15 p-1 self-start">
            {[
              { key: "client", label: "For clients" },
              { key: "pro", label: "For pros" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-gold text-ink"
                    : "text-thread/60 hover:text-canvas"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative grid sm:grid-cols-3 gap-8">
          <div
            aria-hidden
            className="seam absolute top-8 left-[16.6%] right-[16.6%] hidden sm:block"
          />
          {steps.map((s, i) => (
            <div key={s.title} className="step-card relative">
              <div className="w-16 h-16 rounded-full bg-ink-soft border border-gold/30 grid place-items-center font-mono text-gold-light relative z-10">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display font-semibold text-xl text-canvas mt-6">
                {s.title}
              </h3>
              <p className="text-thread/60 mt-2 text-sm leading-relaxed max-w-xs">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}