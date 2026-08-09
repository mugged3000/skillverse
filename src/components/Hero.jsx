"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HERO_STATS } from "@/lib/heroData";
import HeroCopy from "./hero/Herocopy";
import CraftTiles from "./hero/CraftTiles";
import PhoneMock from "./hero/PhoneMock";
import VerifiedBadge from "./hero/VerifiedBadge";

export default function Hero() {
  const root = useRef(null);
  const statRefs = useRef([]);
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.__skillverseLoaded)
  );

  // Wait for the Loader's handoff event before this section animates in.
  // This is what keeps the loader and hero from both animating at once
  // underneath the overlay. (If the loader already finished before this
  // component mounted, the lazy state initializer above already caught
  // that — this effect only needs to handle the "still waiting" case.)
  useEffect(() => {
    if (ready) return;
    const onReady = () => setReady(true);
    window.addEventListener("skillverse:ready", onReady);
    // Safety net: if the loader ever fails to fire (JS error, etc.)
    // the hero should still reveal itself rather than staying hidden.
    const fallback = setTimeout(() => setReady(true), 4000);
    return () => {
      window.removeEventListener("skillverse:ready", onReady);
      clearTimeout(fallback);
    };
  }, [ready]);

  useGSAP(
    () => {
      if (!ready) return;

      function animateStats() {
        statRefs.current.forEach((el, i) => {
          if (!el) return;
          const target = HERO_STATS[i].value;
          const counter = { val: 0 };
          gsap.to(counter, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent =
                Math.floor(counter.val).toLocaleString("en-US") +
                HERO_STATS[i].suffix;
            },
          });
        });
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-eyebrow", { y: 18, autoAlpha: 0, duration: 0.6 })
        .from(
          ".hero-line",
          {
            yPercent: 120,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.09,
          },
          "-=0.3"
        )
        .from(".hero-sub", { y: 16, autoAlpha: 0, duration: 0.6 }, "-=0.45")
        .from(
          ".hero-cta",
          { y: 14, autoAlpha: 0, duration: 0.55, stagger: 0.1 },
          "-=0.35"
        )
        .from(
          ".hero-stat",
          {
            y: 12,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.08,
            onComplete: animateStats,
          },
          "-=0.3"
        )
        .from(
          ".hero-phone",
          { autoAlpha: 0, scale: 0.8, y: 30, duration: 1, ease: "power4.out" },
          "-=0.9"
        )
        .from(
          ".hero-phone-item",
          {
            autoAlpha: 0,
            y: 10,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-tile",
          {
            autoAlpha: 0,
            scale: 0.7,
            duration: 0.75,
            ease: "back.out(1.6)",
            stagger: 0.12,
          },
          "-=0.9"
        )
        .from(
          ".hero-badge",
          { autoAlpha: 0, scale: 0.4, duration: 0.6, ease: "back.out(2)" },
          "-=0.3"
        );

      // ambient float loops (start once entrance settles)
      gsap.to(".hero-phone", {
        y: -10,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.8,
      });
      gsap.to(".hero-badge", {
        rotate: "+=360",
        duration: 18,
        ease: "none",
        repeat: -1,
      });
      gsap.utils.toArray(".hero-tile").forEach((tile, i) => {
        gsap.to(tile, {
          y: -8,
          duration: 3.4 + i * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2 + i * 0.2,
        });
      });

      // subtle pointer parallax on desktop
      const mq = window.matchMedia("(min-width: 1024px)");
      let cleanup = () => {};
      if (mq.matches && root.current) {
        const visual = root.current.querySelector(".hero-visual");
        if (visual) {
          const xTo = gsap.quickTo(".hero-parallax", "x", {
            duration: 0.8,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(".hero-parallax", "y", {
            duration: 0.8,
            ease: "power3.out",
          });
          const onMove = (e) => {
            const rect = visual.getBoundingClientRect();
            const relX = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const relY = (e.clientY - rect.top - rect.height / 2) / rect.height;
            xTo(relX * 18);
            yTo(relY * 18);
          };
          visual.addEventListener("mousemove", onMove);
          cleanup = () => visual.removeEventListener("mousemove", onMove);
        }
      }
      return cleanup;
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative overflow-hidden bg-ink pt-32 pb-24 lg:pt-40 lg:pb-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] w-[640px] h-[640px] rounded-full bg-emerald/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] w-[520px] h-[520px] rounded-full bg-clay/15 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
        <HeroCopy statRefs={statRefs} />

        {/* Visual column */}
        <div className="hero-visual relative h-[540px] sm:h-[640px] lg:h-[700px]">
          <div className="hero-parallax absolute inset-0">
            <CraftTiles />
            <PhoneMock />
            <VerifiedBadge />
          </div>
        </div>
      </div>
    </section>
  );
}