"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsapPlugins";
import { useGSAP } from "@gsap/react";

export default function CTASection() {
  const root = useRef(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useGSAP(
    () => {
      gsap.from(".cta-inner > *", {
        scrollTrigger: { trigger: root.current, start: "top 82%" },
        y: 24,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    { scope: root }
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section id="waitlist" ref={root} className="bg-ink py-24 lg:py-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="cta-inner relative overflow-hidden rounded-[2rem] bg-gold px-8 py-14 sm:px-16 sm:py-20 text-center grain">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60 mb-4">
            Early access · Nigeria first
          </p>
          <h2 className="font-display font-semibold text-4xl sm:text-5xl text-ink text-balance max-w-2xl mx-auto">
            Be first to book — or be first to get booked.
          </h2>
          <p className="text-ink/70 mt-4 max-w-md mx-auto">
            Join the SkillVerse waitlist and we&rsquo;ll notify you the moment your
            city goes live.
          </p>

          {submitted ? (
            <p className="mt-8 font-mono text-ink bg-canvas/60 inline-block px-5 py-3 rounded-full">
              You&rsquo;re on the list. See you soon 👋
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 rounded-full px-5 py-3.5 bg-canvas text-ink placeholder:text-ink/40 outline-none border border-ink/10 focus:border-ink/30"
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3.5 bg-ink text-canvas font-semibold hover:bg-ink-soft transition-colors"
              >
                Join waitlist
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}