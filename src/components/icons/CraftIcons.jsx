/*
  Hand-drawn-feel line icons for each craft category.
  Single stroke weight, rounded caps — kept intentionally simple
  so they read at thumbnail size, matching the stitched/etched
  motif used across SkillVerse.
*/

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function NailsIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M16 8c-3 0-5 2.4-5 6v18c0 6.6 5.8 10 9 10s9-3.4 9-10V14c0-3.6-2-6-5-6" />
      <path d="M11 16c3 1.6 12 1.6 15 0" />
      <path d="M31 12l3.4-3.4M33.6 16.4l4.6-1.6M31.6 21l4.9.8" />
    </svg>
  );
}

export function BarberIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <circle cx="14" cy="14" r="5" />
      <circle cx="14" cy="34" r="5" />
      <path d="M38 10 17.5 31.5M17 16.5 38 38" />
    </svg>
  );
}

export function MakeupIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M20 6h6l1 8h-8z" />
      <path d="M19 14h8l1.4 20.4c.2 3-2.2 5.6-5.2 5.6h0c-3 0-5.4-2.6-5.2-5.6z" />
      <circle cx="36" cy="30" r="7" />
      <path d="M36 25.5v9M31.5 30h9" />
    </svg>
  );
}

export function LashesIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M4 24c6-8 14-12 20-12s14 4 20 12c-6 8-14 12-20 12S10 32 4 24Z" />
      <circle cx="24" cy="24" r="5.5" />
      <path d="M9 16 6 11M17 11.5 15 6M31 11.5 33 6M39 16 42 11" />
    </svg>
  );
}

export function SewingIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <circle cx="15" cy="24" r="9" />
      <path d="M15 17.5v13M11 20.5h8M11 27.5h8" />
      <path d="M23 30c6 6 12 8 19 6M30 8c-1 7 1 13 6 17" strokeDasharray="1 5" />
      <circle cx="42" cy="36" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CarpentryIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M6 40 26 20" />
      <path d="M21.5 15.5 32.5 26.5 26 33l-11-11Z" />
      <path d="M31 10l7 7-3.3 3.3-7-7Z" />
    </svg>
  );
}

export function PedicureIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...props}>
      <path d="M14 8c-3.5 1-5 4.4-5 9v13c0 6.6 4.6 12 11 12s11-4.8 11-11c0-5-2.6-7-2.6-12.4C28.4 12.4 23 6 16 8" />
      <path d="M18 6.5c1.6 2 1.4 4.6-1 6M23 6c1.6 2.4 1.2 5-1.4 6.6" />
    </svg>
  );
}

export const CRAFT_ICONS = {
  nails: NailsIcon,
  barbing: BarberIcon,
  makeup: MakeupIcon,
  lashes: LashesIcon,
  tailoring: SewingIcon,
  carpentry: CarpentryIcon,
  pedicure: PedicureIcon,
};