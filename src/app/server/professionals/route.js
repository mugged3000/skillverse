import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

// Same list as the one in BecomeProfessionalForm.jsx — kept inline
// rather than a shared import. If you ever change one, change both.
const CRAFTS = [
  { key: "nail-tech", name: "Nail Tech" },
  { key: "lash-artist", name: "Lash Artist" },
  { key: "makeup-artist", name: "Makeup Artist" },
  { key: "barber", name: "Barber" },
  { key: "hair-stylist", name: "Hair Stylist" },
  { key: "tailor", name: "Tailor" },
];

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

  // Hand back the craft's display name (not just its key) so the
  // client can build the /feed?welcome=<name> redirect without needing
  // its own copy of the list.
  const craft = CRAFTS.find((c) => c.key === craftKey);

  return NextResponse.json({ id: profile.id, craftLabel: craft?.name ?? craftKey });
}