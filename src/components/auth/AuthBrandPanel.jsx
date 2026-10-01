import { forwardRef } from "react";
import Link from "next/link";

// The brand panel shared by SignUpForm and LoginForm.
// - lg and up: full-height side panel, same as before.
// - Below lg: a compact horizontal banner stacked above the form
//   (it's already first in the DOM, so no reordering needed — just no
//   longer `hidden`), with the secondary stat line dropped to keep it
//   short on a phone screen.
const AuthBrandPanel = forwardRef(function AuthBrandPanel(
  { image, quote, attribution },
  ref
) {
  return (
    <div
      ref={ref}
      className="relative flex flex-col justify-between overflow-hidden h-56 sm:h-72 lg:h-auto p-6 lg:p-12"
    >
      <div className="absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/55" />
      </div>

      <Link href="/" className="relative z-10 flex items-center gap-2 w-fit">
        <span className="grid place-items-center w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gold text-ink font-display font-bold text-xs lg:text-sm">
          Sv
        </span>
        <span className="font-display font-semibold text-base lg:text-lg text-canvas">
          SkillVerse
        </span>
      </Link>

      <div className="relative z-10 max-w-md">
        <p className="font-display italic text-lg lg:text-2xl text-canvas leading-snug">
          {quote}
        </p>
        <p className="mt-2 lg:mt-4 font-mono text-[10px] lg:text-[11px] tracking-[0.16em] text-gold-light">
          {attribution}
        </p>

        {/* Keep the panel short on mobile — this extra proof line only
            shows once there's room for it on lg+. */}
        <div className="hidden lg:block">
          <div className="stitch-rule light mt-8" />
          <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-thread/60">
            12,000+ SKILLED HANDS ALREADY ON SKILLVERSE
          </p>
        </div>
      </div>
    </div>
  );
});

export default AuthBrandPanel;