"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LINKS } from "@/lib/navLinks";

// Toggle button + the tall vertical menu card it opens — self-contained
// (Navbar doesn't need to read or set this open state). Returned as a
// fragment: the button sits in the header's main row where it's
// rendered, the panel is an absolutely-positioned sibling — since
// neither that row nor <nav> sets a `position`, the header (position:
// fixed) is still their containing block regardless of nesting depth.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const linkRefs = useRef([]);

  // Close on Escape, and never leave the page scroll-locked behind us.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on a click/tap anywhere outside the menu (or the toggle
  // button) — a document-level listener rather than an overlay div, so
  // this holds up regardless of stacking order elsewhere on the page.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (toggleRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Compact card anchored top-right under the toggle, not a full-height
  // side panel. Pure fade + slight scale/lift, the links stagger in
  // after; quicker reverse on close.
  useGSAP(
    () => {
      if (!menuRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (open) {
        document.body.style.overflow = "hidden";
        tl.set(menuRef.current, { pointerEvents: "auto" })
          .fromTo(
            menuRef.current,
            { autoAlpha: 0, scale: 0.94, y: -10 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" },
            0
          )
          .fromTo(
            linkRefs.current,
            { autoAlpha: 0, y: -8 },
            { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" },
            "-=0.22"
          );
      } else {
        document.body.style.overflow = "";
        tl.to(
          linkRefs.current,
          { autoAlpha: 0, y: -6, duration: 0.18, stagger: 0.02, ease: "power2.in" },
          0
        )
          .to(
            menuRef.current,
            { autoAlpha: 0, scale: 0.96, y: -8, duration: 0.28, ease: "power2.in" },
            "-=0.1"
          )
          .set(menuRef.current, { pointerEvents: "none" });
      }
    },
    { dependencies: [open] }
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="md:hidden grid place-items-center w-10 h-10 rounded-full border border-thread/20 text-thread"
      >
        <span className="sr-only">Menu</span>
        <div className="w-4 flex flex-col gap-1">
          <span
            className={
              "h-px bg-current transition-transform " + (open ? "translate-y-1.5 rotate-45" : "")
            }
          />
          <span className={"h-px bg-current transition-opacity " + (open ? "opacity-0" : "")} />
          <span
            className={
              "h-px bg-current transition-transform " +
              (open ? "-translate-y-1.5 -rotate-45" : "")
            }
          />
        </div>
      </button>

      {/* Vertical menu card, anchored top-right under the toggle button —
          tall (close to 90% of viewport height) rather than a short
          compact card. */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        style={{ transformOrigin: "top right", pointerEvents: "none" }}
        className="md:hidden invisible opacity-0 absolute right-4 top-full mt-3 z-[60] w-72 h-[90vh] max-h-[46rem] flex flex-col rounded-2xl border border-thread/10 bg-ink-soft shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)] p-6"
      >
        <div className="flex items-center gap-2 pb-5 border-b border-thread/10">
          <span className="grid place-items-center w-9 h-9 rounded-full bg-gold text-ink font-display font-bold text-sm">
            Sv
          </span>
          <span className="font-display font-semibold text-canvas">Menu</span>
        </div>

        <nav className="flex-1 flex flex-col justify-center gap-1">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              ref={(el) => (linkRefs.current[i] = el)}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-5 border-b border-thread/10 text-lg text-thread/85 hover:text-gold-light transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <a
            ref={(el) => (linkRefs.current[LINKS.length] = el)}
            href="/login"
            onClick={() => setOpen(false)}
            className="text-center text-sm text-thread/80 py-3 rounded-full border border-thread/15 hover:text-canvas hover:border-thread/30 transition-colors"
          >
            Sign in
          </a>
          <a
            ref={(el) => (linkRefs.current[LINKS.length + 1] = el)}
            href="/signup-form"
            onClick={() => setOpen(false)}
            className="text-center text-sm font-semibold bg-gold text-ink px-4 py-3.5 rounded-full hover:bg-gold-light transition-colors"
          >
            Join free
          </a>
          <p className="mt-2 text-center font-mono text-[10px] tracking-[0.16em] text-thread/40">
            SKILLED HANDS, SEEN EVERYWHERE
          </p>
        </div>
      </div>
    </>
  );
}