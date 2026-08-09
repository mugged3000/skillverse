import { forwardRef } from "react";
import Link from "next/link";

// The left-side brand panel shared by SignUpForm and LoginForm — was
// duplicated markup with only the image/quote/attribution differing.
// forwardRef so each form can still target it directly in its own GSAP
// entrance timeline, same as before.
const AuthBrandPanel = forwardRef(function AuthBrandPanel(
  { image, quote, attribution },
  ref
) {
  return (
    <div
      ref={ref}
      className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
    >
      <div className="absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/55" />
      </div>

      <Link href="/" className="relative z-10 flex items-center gap-2 w-fit">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-gold text-ink font-display font-bold text-sm">
          Sv
        </span>
        <span className="font-display font-semibold text-lg text-canvas">SkillVerse</span>
      </Link>

      <div className="relative z-10 max-w-md">
        <p className="font-display italic text-2xl text-canvas leading-snug">{quote}</p>
        <p className="mt-4 font-mono text-[11px] tracking-[0.16em] text-gold-light">
          {attribution}
        </p>
        <div className="stitch-rule light mt-8" />
        <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-thread/60">
          12,000+ SKILLED HANDS ALREADY ON SKILLVERSE
        </p>
      </div>
    </div>
  );
});

export default AuthBrandPanel;