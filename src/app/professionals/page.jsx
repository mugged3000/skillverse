import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import FeedHeader from "@/components/feed/FeedHeader";
import ProfessionalsBrowser from "@/components/ProfessionalsBrowser";
// export const dynamic = "force-dynamic";
// Same craft-key -> display-name mapping used in
// /server/professionals/route.js and the profile page. Kept inline in
// each spot on purpose (see the comment in that route file).
const CRAFTS = [
  { key: "nail-tech", name: "Nail Tech" },
  { key: "lash-artist", name: "Lash Artist" },
  { key: "makeup-artist", name: "Makeup Artist" },
  { key: "barber", name: "Barber" },
  { key: "hair-stylist", name: "Hair Stylist" },
  { key: "tailor", name: "Tailor" },
];

function craftLabelFor(key) {
  const craft = CRAFTS.find((c) => c.key === key);
  if (craft) return craft.name;
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const PAGE_SIZE = 100;

export const metadata = {
  title: "Discover professionals — SkillVerse",
  description: "Browse every professional on SkillVerse, not just the ones currently posting.",
};

// The "Discover professionals" page — every professional profile that
// has ever been created, most recent first, capped at PAGE_SIZE with a
// live name search on top (handled client-side in ProfessionalsBrowser,
// which re-queries /server/professionals?q= as the person types).
export default async function ProfessionalsIndexPage() {
  const viewerId = await getSessionUserId();

  const [profiles, total] = await Promise.all([
    prisma.professionalProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            _count: { select: { followers: true } },
          },
        },
      },
    }),
    prisma.professionalProfile.count(),
  ]);

  const initialProfessionals = profiles.map((p) => ({
    userId: p.userId,
    name: p.user.name,
    avatarUrl: p.user.avatarUrl,
    craftKey: p.craftKey,
    craftLabel: craftLabelFor(p.craftKey),
    location: p.location,
    bio: p.bio,
    followerCount: p.user._count.followers,
  }));

  return (
    <main className="min-h-dvh bg-ink relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] w-[520px] h-[520px] rounded-full bg-emerald/15 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[40%] left-[-15%] w-[440px] h-[440px] rounded-full bg-gold/10 blur-[140px]"
      />

      <FeedHeader showBackToFeed viewerId={viewerId} />

      <div className="relative mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold-light">
            The guild
          </p>
          <h1 className="font-display font-semibold text-3xl text-canvas mt-1.5">
            Discover professionals.
          </h1>
          <p className="mt-2 text-thread/60">
            Every skilled hand on SkillVerse — not just who&rsquo;s posted lately.
          </p>
        </div>

        <ProfessionalsBrowser initialProfessionals={initialProfessionals} initialTotal={total} />
      </div>
    </main>
  );
}
