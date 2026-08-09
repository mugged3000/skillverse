// Sticker badges for the preloader (src/components/Loader.jsx). Each
// just points at an image path — no JS import to break. Drop your
// downloaded SVGs into `public/craft-icons/` using these filenames (or
// edit the `src` values to match whatever you name them). Until a file
// exists at that path the badge still renders fine, just empty.
export const STICKERS = [
  { src: "/craft-icons/nails.svg", bg: "bg-gold", left: "9%", top: "16%", rotate: -10 },
  { src: "/craft-icons/makeup.svg", bg: "bg-clay", left: "84%", top: "14%", rotate: 8 },
  { src: "/craft-icons/tailoring.svg", bg: "bg-emerald", left: "14%", top: "72%", rotate: 6 },
  { src: "/craft-icons/barbing.svg", bg: "bg-ink-soft", left: "80%", top: "70%", rotate: -7 },
  { src: "/craft-icons/lashes.svg", bg: "bg-gold-light", left: "48%", top: "10%", rotate: 5 },
  { src: "/craft-icons/pedicure.svg", bg: "bg-clay-light", left: "50%", top: "80%", rotate: -5 },
];