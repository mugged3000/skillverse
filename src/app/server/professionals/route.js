import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

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
  // Fall back to title-casing an unknown key so this never renders blank.
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 100;

// Powers the "Discover professionals" page: everyone who has ever
// created a professional profile, not just the ones who've posted —
// with an optional ?q= name search and a capped page size.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limitParam = parseInt(searchParams.get("limit"), 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const where = q
    ? { user: { name: { contains: q, mode: "insensitive" } } }
    : undefined;

  const [profiles, total] = await Promise.all([
    prisma.professionalProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
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
    prisma.professionalProfile.count({ where }),
  ]);

  const professionals = profiles.map((p) => ({
    userId: p.userId,
    name: p.user.name,
    avatarUrl: p.user.avatarUrl,
    craftKey: p.craftKey,
    craftLabel: craftLabelFor(p.craftKey),
    location: p.location,
    bio: p.bio,
    followerCount: p.user._count.followers,
  }));

  return NextResponse.json({ professionals, total, limit });
}

export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const existing = await prisma.professionalProfile.findUnique({ where: { userId } });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a professional profile." },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const craftKey = body?.craftKey?.trim();
  const bio = body?.bio?.trim();
  const location = body?.location?.trim();

  if (!craftKey || !bio || !location) {
    return NextResponse.json(
      { error: "Craft, bio, and location are all required." },
      { status: 400 }
    );
  }

  const profile = await prisma.professionalProfile.create({
    data: { userId, craftKey, bio, location },
  });

  // Hand back the craft's display name and the user's id — the name so
  // the client can build the /welcome message, the id so it knows
  // which profile URL to redirect to.
  return NextResponse.json({
    id: profile.id,
    userId,
    craftLabel: craftLabelFor(craftKey),
  });
}