"use client";

import { CRAFTS } from "@/lib/crafts";

export default function MarqueeStrip() {
  const row = [...CRAFTS, ...CRAFTS];
  return (
    <div className="bg-ink-soft border-y border-thread/10 py-4 overflow-hidden">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0">
            {row.map((c, i) => (
              <span
                key={copy + "-" + c.key + "-" + i}
                className="flex items-center gap-3 px-8 font-mono text-xs uppercase tracking-[0.2em] text-thread/40 whitespace-nowrap"
              >
                {c.tag}
                <span className="w-1 h-1 rounded-full bg-gold/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}