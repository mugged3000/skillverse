"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Small explainer modal used by the "For pros" mega-menu — pass one of
// PRO_ITEMS (see src/lib/proInfo.js) as `content`, or null to render
// nothing.
export default function ProInfoModal({ content, onClose }) {
  const backdropRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      if (!content || !backdropRef.current || !cardRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3 }
      ).fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 20, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" },
        "-=0.15"
      );
    },
    { dependencies: [content] }
  );

  useEffect(() => {
    if (!content) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!content) return null;

  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center px-6">
      <div
        ref={backdropRef}
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={content.title}
        className="relative w-full max-w-md rounded-3xl border border-thread/10 bg-ink-soft p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 grid place-items-center w-8 h-8 rounded-full border border-thread/20 text-thread hover:text-canvas transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1l10 10M11 1 1 11"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <span className="inline-grid place-items-center w-11 h-11 rounded-2xl bg-gold text-ink mb-5">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </span>

        <h3 className="font-display font-semibold text-2xl text-canvas">{content.title}</h3>
        <p className="mt-3 text-sm text-thread/75 leading-relaxed">{content.intro}</p>

        <ul className="mt-5 space-y-2.5">
          {content.points.map((point) => (
            <li key={point} className="flex gap-2.5 text-sm text-thread/80">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gold shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}