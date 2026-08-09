"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CheckCircle2, X } from "lucide-react";

// Shown once, right after someone finishes setting up their pro
// profile — redirect them to /feed?welcome=<Craft Name> and this picks
// it up. Dismissible, and clears the query param on dismiss (or after
// a few seconds) so refreshing or coming back later doesn't keep
// showing it.
export default function WelcomeBanner({ craftLabel }) {
  const router = useRouter();
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(Boolean(craftLabel));

  useGSAP(
    () => {
      if (!visible || !rootRef.current) return;
      gsap.from(rootRef.current, {
        y: -14,
        autoAlpha: 0,
        duration: 0.55,
        ease: "power3.out",
      });
    },
    { dependencies: [visible] }
  );

  function dismiss() {
    setVisible(false);
    router.replace("/feed", { scroll: false });
  }

  if (!craftLabel || !visible) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-light/30 bg-emerald/10 px-4 py-3.5"
    >
      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-light" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-canvas">
          You&rsquo;re live as a {craftLabel} pro.
        </p>
        <p className="mt-0.5 text-sm text-thread/60">
          Your profile is up — share your work here and clients can start finding you.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-thread/40 hover:text-canvas transition-colors"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}