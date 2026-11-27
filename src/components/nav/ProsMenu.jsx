"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PRO_ITEMS } from "@/lib/proInfo";
import ProInfoModal from "@/components/ProInfoModal";

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
    closeTimer.current = setTimeout(() => {
      setProsOpen(false);
    }, 220);
  };

  const togglePros = () => {
    if (prosOpen) setProsOpen(false);
    else openPros();
  };

  const openProModal = (key) => {
    setProsOpen(false);
    setActiveProModal(key);
  };

  useEffect(() => {
    if (!prosOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setProsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prosOpen]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useGSAP(
    () => {
      if (!prosPanelRef.current) return;
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });
      if (prosOpen) {
        tl.set(prosPanelRef.current, { pointerEvents: "auto" });
        tl.fromTo(
          prosPanelRef.current,
          { autoAlpha: 0, y: -16, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 },
          0
        );
        tl.fromTo(
          prosCardRef.current,
          { autoAlpha: 0, x: -18 },
          { autoAlpha: 1, x: 0, duration: 0.5 },
          "-=0.32"
        );
        tl.fromTo(
          prosItemRefs.current,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 },
          "-=0.32"
        );
      } else {
        tl.to(prosPanelRef.current, {
          autoAlpha: 0,
          y: -10,
          scale: 0.98,
          duration: 0.3,
          ease: "power2.in",
        });
        tl.set(prosPanelRef.current, { pointerEvents: "none" });
      }
    },
    { dependencies: [prosOpen] }
  );

  return (
    <>
      <div
        className="relative"
        onMouseEnter={openPros}
        onMouseLeave={scheduleClosePros}
      >
        <button
          id="pros-menu-btn"
          type="button"
          onClick={togglePros}
          aria-expanded={prosOpen}
          className="nav-link flex items-center gap-1.5 text-sm text-thread/70 hover:text-gold-light transition-colors"
        >
          For pros
          <span>v</span>
        </button>
      </div>

      <div
        ref={prosPanelRef}
        onMouseEnter={openPros}
        onMouseLeave={scheduleClosePros}
        aria-hidden={!prosOpen}
        style={{
          pointerEvents: "none",
          width: "92vw",
          height: "85vh",
          maxHeight: "46rem",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        className="block invisible opacity-0 absolute top-full mt-3 z-60 rounded-3xl overflow-y-auto border border-thread/10 bg-ink-soft shadow-xl"
      >
        <div className="absolute inset-0" aria-hidden>
          <img
            src="/images/tailor.jpg"
            alt=""
            style={{ filter: "blur(2px)", opacity: 0.3 }}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/93 to-ink/80" />
        </div>

        <div className="relative h-full flex flex-col">
          <div
            className="flex-1 grid grid-cols-1 gap-8 p-6 overflow-visible"
            style={{ gridTemplateColumns: "1fr" }}
          >
            <div
              ref={prosCardRef}
              style={{ minHeight: 220 }}
              className="relative rounded-2xl overflow-hidden border border-thread/10"
            >
              <img
                src="/images/banner.jpg"
                alt="Tailor at work"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6">
                <span
                  style={{ fontSize: 10 }}
                  className="self-start mb-3 px-2.5 py-1 rounded-full bg-gold text-ink font-mono tracking-widest"
                >
                  NEW
                </span>
                <h3 className="font-display text-xl text-canvas">
                  Become a verified pro
                </h3>
                <p className="mt-2 text-sm text-thread/75 leading-relaxed">
                  List your craft, get discovered nearby, and turn your
                  skill into a steady stream of bookings.
                </p>
                <a
                  href="#waitlist"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-gold-light hover:text-gold transition-colors"
                >
                  Read more
                </a>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 max-w-md">
              {PRO_ITEMS.map((item, i) => (
                <button
                  key={item.key}
                  type="button"
                  ref={(el) => {
                    prosItemRefs.current[i] = el;
                  }}
                  onClick={() => openProModal(item.key)}
                  className="group flex items-center gap-4 rounded-2xl border border-transparent px-4 py-4 text-left hover:border-thread/10 hover:bg-ink/40 transition-colors"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-ink text-gold-light shrink-0">
                    <item.icon
                      className="w-5 h-5"
                      strokeWidth={1.75}
                    />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg text-canvas">
                      {item.label}
                    </span>
                    <span className="block text-sm text-thread/60 mt-0.5">
                      {item.intro}
                    </span>
                  </span>
                  <span className="shrink-0">-&gt;</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-thread/10 py-4 text-center">
            <p
              style={{ fontSize: 11 }}
              className="font-mono tracking-widest text-thread/50"
            >
              BUILT FOR THE HANDS THAT BUILD EVERYTHING ELSE
            </p>
          </div>
        </div>
      </div>

      <ProInfoModal
        content={
          PRO_ITEMS.find((item) => item.key === activeProModal) ?? null
        }
        onClose={() => setActiveProModal(null)}
      />
    </>
  );
}