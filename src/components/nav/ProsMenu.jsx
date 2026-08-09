"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PRO_ITEMS } from "@/lib/proInfo";
import ProInfoModal from "@/components/ProInfoModal";

// The "For pros" nav item — desktop-only hover mega-menu, self-contained
// (Navbar doesn't need to know anything about its open state). Renders
// as a fragment: the trigger link sits in the desktop nav row, the
// panel + modal are separate absolutely-positioned siblings within the
// header, unaffected by where in the tree they're declared since
// neither the surrounding <nav> nor the flex row it sits in sets a
// `position`, so the header (position: fixed) stays their containing
// block either way.
export default function ProsMenu() {
  const [prosOpen, setProsOpen] = useState(false);
  const [activeProModal, setActiveProModal] = useState(null);
  const prosPanelRef = useRef(null);
  const prosCardRef = useRef(null);
  const prosItemRefs = useRef([]);
  const closeTimer = useRef(null);

  const openPros = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setProsOpen(true);
  };
  const scheduleClosePros = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setProsOpen(false), 220);
  };
  const openProModal = (key) => {
    setProsOpen(false);
    setActiveProModal(key);
  };

  useEffect(() => {
    if (!prosOpen) return;
    const onKey = (e) => e.key === "Escape" && setProsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prosOpen]);

  useEffect(() => () => closeTimer.current && clearTimeout(closeTimer.current), []);

  // "For pros" mega-menu — fades/lifts in on hover, the promo card and
  // the four info items stagger in right after; quick reverse on close.
  useGSAP(
    () => {
      if (!prosPanelRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (prosOpen) {
        tl.set(prosPanelRef.current, { pointerEvents: "auto" })
          .fromTo(
            prosPanelRef.current,
            { autoAlpha: 0, y: -16, scale: 0.98 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
            0
          )
          .fromTo(
            prosCardRef.current,
            { autoAlpha: 0, x: -18 },
            { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out" },
            "-=0.32"
          )
          .fromTo(
            prosItemRefs.current,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
            "-=0.32"
          );
      } else {
        tl.to(prosPanelRef.current, {
          autoAlpha: 0,
          y: -10,
          scale: 0.98,
          duration: 0.3,
          ease: "power2.in",
        }).set(prosPanelRef.current, { pointerEvents: "none" });
      }
    },
    { dependencies: [prosOpen] }
  );

  return (
    <>
      <div className="relative" onMouseEnter={openPros} onMouseLeave={scheduleClosePros}>
        <a
          href="#pros"
          className="nav-link flex items-center gap-1.5 text-sm text-thread/70 hover:text-gold-light transition-colors"
        >
          For pros
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            className={"transition-transform duration-300 " + (prosOpen ? "rotate-180" : "")}
          >
            <path
              d="M1.5 3 4.5 6 7.5 3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {/* "For pros" mega-menu — desktop only, opens on hover, covers
          80% viewport width and 80vh, centered under the navbar. */}
      <div
        ref={prosPanelRef}
        onMouseEnter={openPros}
        onMouseLeave={scheduleClosePros}
        aria-hidden={!prosOpen}
        style={{ pointerEvents: "none" }}
        className="hidden md:block invisible opacity-0 absolute left-1/2 -translate-x-1/2 top-full mt-3 z-[60] w-[80vw] h-[80vh] max-h-[46rem] rounded-3xl overflow-hidden border border-thread/10 bg-ink-soft shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]"
      >
        {/* Blurred craft photo + dark scrim, matching the moody
            photographic backdrop this style of mega-menu usually has. */}
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/tailor.jpg"
            alt=""
            className="w-full h-full object-cover scale-105 blur-[2px] opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/93 to-ink/80" />
        </div>

        <div className="relative h-full flex flex-col">
          <div className="flex-1 grid grid-cols-[minmax(0,340px)_1fr] gap-12 p-12 lg:p-16 overflow-hidden">
            {/* Promo card */}
            <div
              ref={prosCardRef}
              className="relative rounded-2xl overflow-hidden border border-thread/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/banner.jpg"
                alt="Tailor at work"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <span className="self-start mb-3 px-2.5 py-1 rounded-full bg-gold text-ink text-[10px] font-mono tracking-widest">
                  NEW
                </span>
                <h3 className="font-display text-xl text-canvas">Become a verified pro</h3>
                <p className="mt-2 text-sm text-thread/75 leading-relaxed">
                  List your craft, get discovered nearby, and turn your skill
                  into a steady stream of bookings.
                </p>
                <a
                  href="#waitlist"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-gold-light hover:text-gold transition-colors"
                >
                  Read more →
                </a>
              </div>
            </div>

            {/* Four info items — each opens a modal explaining what it's
                about, instead of a long list of separate pages. */}
            <div className="flex flex-col justify-center gap-2 max-w-md">
              {PRO_ITEMS.map((item, i) => (
                <button
                  key={item.key}
                  type="button"
                  ref={(el) => (prosItemRefs.current[i] = el)}
                  onClick={() => openProModal(item.key)}
                  className="group flex items-center gap-4 rounded-2xl border border-transparent px-4 py-4 text-left hover:border-thread/10 hover:bg-ink/40 transition-colors"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-ink text-gold-light shrink-0">
                    <item.icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg text-canvas">{item.label}</span>
                    <span className="block text-sm text-thread/60 mt-0.5">{item.intro}</span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0"
                  >
                    <path
                      d="M4 12 12 4M6 4h6v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-thread/10 py-4 text-center">
            <p className="font-mono text-[11px] tracking-[0.14em] text-thread/50">
              BUILT FOR THE HANDS THAT BUILD EVERYTHING ELSE
            </p>
          </div>
        </div>
      </div>

      <ProInfoModal
        content={PRO_ITEMS.find((item) => item.key === activeProModal) ?? null}
        onClose={() => setActiveProModal(null)}
      />
    </>
  );
}