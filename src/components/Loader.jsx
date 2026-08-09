"use client";

/*
  SkillVerse preloader.

  Craft "sticker" badges drop in from above and land with a bouncy
  ease, while a row of bars pulse up and down like a bar chart /
  equalizer beside the mark. When loading finishes, the bars snap up
  together in sync, then everything fades and the overlay closes like
  a camera aperture, handing off to Hero via a "skillverse:ready"
  window event.

  ── SVG ICONS ──────────────────────────────────────────────────────
  Each sticker below just points at an image path — no JS import to
  break. Drop your downloaded SVGs into `public/craft-icons/` using
  the exact filenames referenced in `src` (or edit the `src` values
  to match whatever you name them). Until a file exists at that path
  the badge still renders fine, just empty — nothing else breaks.
  ────────────────────────────────────────────────────────────────────
*/

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const STICKERS = [
  // 👉 public/craft-icons/nails.svg
  { src: "/craft-icons/nails.svg", bg: "bg-gold", left: "9%", top: "16%", rotate: -10 },
  // 👉 public/craft-icons/makeup.svg
  { src: "/craft-icons/makeup.svg", bg: "bg-clay", left: "84%", top: "14%", rotate: 8 },
  // 👉 public/craft-icons/tailoring.svg
  { src: "/craft-icons/tailoring.svg", bg: "bg-emerald", left: "14%", top: "72%", rotate: 6 },
  // 👉 public/craft-icons/barbing.svg
  { src: "/craft-icons/barbing.svg", bg: "bg-ink-soft", left: "80%", top: "70%", rotate: -7 },
  // 👉 public/craft-icons/lashes.svg
  { src: "/craft-icons/lashes.svg", bg: "bg-gold-light", left: "48%", top: "10%", rotate: 5 },
  // 👉 public/craft-icons/pedicure.svg
  { src: "/craft-icons/pedicure.svg", bg: "bg-clay-light", left: "50%", top: "80%", rotate: -5 },
];

// Bar-chart / equalizer loader: each bar loops up and down at its own
// pace while loading, then all snap to full height together when done.
const BAR_COUNT = 6;

export default function Loader() {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const markRef = useRef(null);
  const chartRef = useRef(null);
  const barRefs = useRef([]);
  const pctRef = useRef(null);
  const taglineRef = useRef(null);
  const stickerRefs = useRef([]);

  const [mounted, setMounted] = useState(
    () => !(typeof window !== "undefined" && window.__skillverseLoaded)
  );

  useEffect(() => {
    if (!mounted) return;

    document.body.style.overflow = "hidden";
    const progressState = { pct: 0 };
    const revealState = { r: 150 };
    const barLoops = [];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Stickers start above the viewport, rotated further than their
      // resting tilt, fully transparent.
      gsap.set(stickerRefs.current, { y: -180, autoAlpha: 0 });
      gsap.set(barRefs.current, { height: "18%" });

      tl.set(overlayRef.current, { autoAlpha: 1 })
        .from(markRef.current, {
          scale: 0.6,
          autoAlpha: 0,
          duration: 0.6,
          ease: "back.out(1.8)",
        })
        .from(
          chartRef.current,
          { autoAlpha: 0, y: 10, duration: 0.45 },
          "-=0.15"
        )
        .from(
          taglineRef.current,
          { autoAlpha: 0, y: 8, duration: 0.5 },
          "-=0.2"
        );

      // Stickers drop in one at a time, staggered across the loading
      // window, each with its own bounce landing.
      stickerRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.to(
          el,
          {
            y: 0,
            autoAlpha: 1,
            rotate: STICKERS[i].rotate,
            duration: 1.05,
            ease: "bounce.out",
          },
          i === 0 ? "-=0.1" : "-=0.55"
        );
      });

      // Each bar pulses up and down independently, like an equalizer —
      // not literally tied to percent, just alive while we load.
      barRefs.current.forEach((el, i) => {
        if (!el) return;
        const loop = gsap.to(el, {
          height: () => 35 + Math.random() * 60 + "%",
          duration: 0.45 + Math.random() * 0.35,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.07,
        });
        barLoops.push(loop);
      });

      // Percentage counter runs alongside everything else.
      tl.to(
        progressState,
        {
          pct: 100,
          duration: 1.9,
          ease: "power2.inOut",
          onUpdate: () => {
            const v = Math.floor(progressState.pct);
            if (pctRef.current) pctRef.current.textContent = String(v).padStart(2, "0");
          },
        },
        "<"
      );

      // Gentle idle wobble once each sticker has landed.
      stickerRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          rotate: STICKERS[i].rotate + (i % 2 === 0 ? 6 : -6),
          duration: 1.8 + i * 0.15,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.2 + i * 0.15,
        });
      });

      const minTime = new Promise((res) => tl.eventCallback("onComplete", res));
      const windowLoaded = new Promise((res) => {
        if (document.readyState === "complete") return res();
        window.addEventListener("load", res, { once: true });
      });
      const safety = new Promise((res) => setTimeout(res, 3600));

      Promise.race([Promise.all([minTime, windowLoaded]), safety]).then(() => {
        // Stop the independent equalizer loops and bring every bar up
        // to full height together — a clear "done" beat.
        barLoops.forEach((loop) => loop.kill());

        const exitTl = gsap.timeline({
          onComplete: () => {
            document.body.style.overflow = "";
            window.__skillverseLoaded = true;
            setMounted(false);
          },
        });

        exitTl
          .to(barRefs.current, {
            height: "100%",
            duration: 0.4,
            stagger: 0.04,
            ease: "power2.out",
          })
          .to(stickerRefs.current, {
            autoAlpha: 0,
            y: 24,
            scale: 0.8,
            duration: 0.4,
            stagger: 0.04,
            ease: "power2.in",
          })
          .to(
            contentRef.current,
            { autoAlpha: 0, scale: 0.92, duration: 0.4, ease: "power2.in" },
            "-=0.25"
          )
          .call(() => {
            window.dispatchEvent(new Event("skillverse:ready"));
          })
          .to(
            revealState,
            {
              r: 0,
              duration: 1.1,
              ease: "power4.inOut",
              onUpdate: () => {
                if (overlayRef.current) {
                  overlayRef.current.style.clipPath = `circle(${revealState.r}% at 50% 50%)`;
                }
              },
            },
            "-=0.15"
          );
      });
    });

    return () => {
      barLoops.forEach((loop) => loop.kill());
      ctx.revert();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] grid place-items-center bg-ink invisible overflow-hidden"
      style={{ clipPath: "circle(150% at 50% 50%)" }}
      aria-hidden={!mounted}
    >
      {/* Falling craft stickers — see the SVG ICONS note at the top of
          this file for where to drop your own artwork in. */}
      {STICKERS.map((s, i) => (
        <div
          key={i}
          ref={(el) => (stickerRefs.current[i] = el)}
          className={
            "absolute w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-xl grid place-items-center " +
            s.bg
          }
          style={{ left: s.left, top: s.top }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.src} alt="" className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
      ))}

      <div ref={contentRef} className="relative z-10 flex flex-col items-center px-6 text-center">
        <div
          ref={markRef}
          className="relative grid place-items-center w-16 h-16 rounded-full bg-gold text-ink font-display font-bold text-xl"
        >
          <span
            aria-hidden
            className="absolute -inset-3 -z-10 rounded-full blur-xl opacity-40"
            style={{ background: "var(--color-gold)" }}
          />
          Sv
        </div>

        {/* Bar-chart / equalizer loader */}
        <div ref={chartRef} className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-end gap-1.5 h-10">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-full rounded-full bg-thread/10 overflow-hidden flex items-end"
              >
                <div
                  ref={(el) => (barRefs.current[i] = el)}
                  className="w-full rounded-full"
                  style={{
                    height: "18%",
                    background:
                      "linear-gradient(180deg, var(--color-gold-light), var(--color-gold))",
                  }}
                />
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-gold-light tracking-widest tabular-nums">
            <span ref={pctRef}>00</span>%
          </p>
        </div>

        <p
          ref={taglineRef}
          className="mt-6 max-w-[15rem] font-display italic text-sm text-thread/70"
        >
          Real hands, verified work, booked in minutes.
        </p>
      </div>
    </div>
  );
}