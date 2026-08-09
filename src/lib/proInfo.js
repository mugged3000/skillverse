// Content for the "For pros" mega-menu. Each item opens a modal
// (see ProInfoModal.jsx) instead of navigating to a separate page.
import { Gift, Compass, HelpCircle, ShieldCheck } from "lucide-react";

export const PRO_ITEMS = [
  {
    key: "benefits",
    label: "Benefits",
    icon: Gift,
    title: "Benefits",
    intro: "What you actually get by listing your craft on SkillVerse.",
    points: [
      "More bookings without chasing DMs or comments",
      "A portfolio built to sell your work, not just show it",
      "A verified badge that builds trust before a client even messages you",
      "Payouts you can see coming, not a black box",
    ],
  },
  {
    key: "how-it-works",
    label: "How it works",
    icon: Compass,
    title: "How it works",
    intro: "Four steps from signing up to getting paid.",
    points: [
      "List your craft — set up your profile and services",
      "Get verified — we confirm your ID and check your work",
      "Get discovered — clients browse by craft and location",
      "Get booked and paid — bookings land in your dashboard, payouts go out weekly",
    ],
  },
  {
    key: "faq",
    label: "FAQ",
    icon: HelpCircle,
    title: "FAQ",
    intro: "The questions pros ask us most.",
    points: [
      "What does SkillVerse take as a fee?",
      "How long does verification take?",
      "What happens if a client doesn't show up?",
      "Can I update my services and pricing anytime?",
    ],
  },
  {
    key: "safety",
    label: "Safety & Trust",
    icon: ShieldCheck,
    title: "Safety & Trust",
    intro: "How we keep the guild safe for everyone in it.",
    points: [
      "Every pro is ID-verified before their badge goes live",
      "A clear dispute process if a booking goes wrong",
      "Reporting tools for abusive or no-show clients",
      "Reviews are tied to real, completed bookings only",
    ],
  },
];