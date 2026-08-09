// /*
//   Duotone scene illustrations for the hero craft tiles.
//   Each fills the whole tile as a background "image" (flat illustration,
//   not a photo — keeps everything on-brand and license-free) depicting
//   the craft in action, with a bottom gradient so the label text stays
//   legible over it.
// */

// function BottomFade({ from }) {
//   return (
//     <div
//       aria-hidden
//       className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
//       style={{
//         background: `linear-gradient(to top, ${from} 0%, transparent 100%)`,
//       }}
//     />
//   );
// }

// export function NailsScene() {
//   return (
//     <div className="absolute inset-0">
//       <svg viewBox="0 0 200 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
//         <rect width="200" height="240" fill="var(--color-emerald)" />
//         {/* hand */}
//         <path
//           d="M60 235 C55 190 50 150 55 120 C57 100 68 92 74 100 C78 106 76 118 76 130
//              L78 96 C78 84 90 82 92 94 L92 132
//              L94 90 C94 78 106 78 106 90 L106 134
//              L110 98 C112 86 124 88 122 100 L112 150
//              C120 160 122 180 118 200 L112 235 Z"
//           fill="var(--color-emerald-light)"
//           opacity="0.9"
//         />
//         {/* painted nail tips */}
//         {[56, 78, 94, 110].map((x, i) => (
//           <rect
//             key={x}
//             x={x - 6}
//             y={i === 0 ? 96 : i === 1 ? 82 : i === 2 ? 76 : 86}
//             width="14"
//             height="10"
//             rx="5"
//             fill="var(--color-gold-light)"
//           />
//         ))}
//         {/* polish bottle */}
//         <g transform="translate(140 150)">
//           <rect x="0" y="14" width="26" height="34" rx="4" fill="var(--color-gold)" />
//           <rect x="8" y="2" width="10" height="14" rx="2" fill="var(--color-ink)" />
//           <rect x="4" y="20" width="18" height="22" rx="2" fill="var(--color-gold-light)" opacity="0.6" />
//         </g>
//       </svg>
//       <BottomFade from="var(--color-emerald)" />
//     </div>
//   );
// }

// export function TailoringScene() {
//   return (
//     <div className="absolute inset-0">
//       <svg viewBox="0 0 200 220" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
//         <rect width="200" height="220" fill="var(--color-clay)" />
//         {/* folded fabric */}
//         <path
//           d="M0 150 C40 130 70 170 110 145 C150 122 170 155 200 138 L200 220 L0 220 Z"
//           fill="var(--color-clay-light)"
//           opacity="0.85"
//         />
//         <path
//           d="M0 175 C45 158 75 190 115 168 C155 148 175 178 200 165 L200 220 L0 220 Z"
//           fill="var(--color-canvas)"
//           opacity="0.15"
//         />
//         {/* spool of thread */}
//         <g transform="translate(30 40)">
//           <ellipse cx="0" cy="0" rx="22" ry="10" fill="var(--color-gold-light)" />
//           <rect x="-22" y="0" width="44" height="26" fill="var(--color-gold)" />
//           <ellipse cx="0" cy="26" rx="22" ry="10" fill="var(--color-gold-light)" />
//         </g>
//         {/* stitched dashed line */}
//         <path
//           d="M20 100 Q90 70 160 110"
//           stroke="var(--color-canvas)"
//           strokeWidth="3"
//           strokeDasharray="6 7"
//           fill="none"
//           opacity="0.8"
//         />
//         {/* needle */}
//         <line x1="150" y1="95" x2="182" y2="118" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
//         <circle cx="182" cy="118" r="3" fill="var(--color-ink)" />
//       </svg>
//       <BottomFade from="var(--color-clay)" />
//     </div>
//   );
// }

// export function MakeupScene() {
//   return (
//     <div className="absolute inset-0">
//       <svg viewBox="0 0 200 180" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
//         <rect width="200" height="180" fill="var(--color-gold)" />
//         {/* face profile */}
//         <path
//           d="M70 150 C55 140 50 118 56 98 C60 78 78 62 100 62 C118 62 126 78 124 92
//              C136 92 140 104 132 112 C138 120 132 130 122 128
//              C120 140 108 150 92 152 Z"
//           fill="var(--color-ink)"
//           opacity="0.85"
//         />
//         {/* blush stroke */}
//         <ellipse cx="88" cy="112" rx="14" ry="8" fill="var(--color-clay-light)" opacity="0.8" />
//         {/* lip mark */}
//         <path d="M78 138 Q92 148 106 138 Q94 146 78 138Z" fill="var(--color-clay)" />
//         {/* mascara wand */}
//         <g transform="translate(150 40) rotate(35)">
//           <rect x="-3" y="0" width="6" height="70" rx="3" fill="var(--color-ink)" />
//           <ellipse cx="0" cy="0" rx="8" ry="5" fill="var(--color-emerald)" />
//         </g>
//       </svg>
//       <BottomFade from="var(--color-gold)" />
//     </div>
//   );
// }

// export function BarberingScene() {
//   return (
//     <div className="absolute inset-0">
//       <svg viewBox="0 0 200 220" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
//         <rect width="200" height="220" fill="var(--color-ink-soft)" />
//         {/* head silhouette */}
//         <path
//           d="M60 210 C50 190 48 160 56 138 C50 118 60 92 88 84 C118 76 142 96 144 122
//              C150 130 150 146 142 152 C144 172 132 196 110 208 Z"
//           fill="var(--color-thread)"
//           opacity="0.9"
//         />
//         {/* fade line */}
//         <path
//           d="M56 138 C74 130 100 128 122 140"
//           stroke="var(--color-gold)"
//           strokeWidth="3"
//           fill="none"
//           opacity="0.9"
//         />
//         {/* clippers */}
//         <g transform="translate(130 150) rotate(-20)">
//           <rect x="0" y="0" width="20" height="46" rx="4" fill="var(--color-gold-light)" />
//           <rect x="-3" y="40" width="26" height="10" rx="2" fill="var(--color-gold)" />
//         </g>
//       </svg>
//       <BottomFade from="var(--color-ink-soft)" />
//     </div>
//   );
// }
