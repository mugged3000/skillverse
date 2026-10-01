import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import { CRAFTS } from "@/lib/crafts";
import { normalizeContactLink } from "@/lib/contactLink";

const MEMBER_BIO_MAX = 160;
const MEMBER_LOCATION_MAX = 60;
const GOAL_MAX = 120;

// Updates the logged-in user's profile.
//  - Professionals: avatar on User, bio/location on ProfessionalProfile
//    (both required, as before).
//  - Regular members: avatar, bio, location and interests all live on
//    User, and every field except the avatar is optional.
export async function PATCH(req) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const avatarUrl = body?.avatarUrl ?? undefined;
  const bio = body?.bio?.trim();
  const location = body?.location?.trim();

  // Optional contact link (used by members and professionals alike).
  // undefined = leave unchanged, "" = remove it.
  let contactLink;
  if (typeof body?.contactLink === "string") {
    const parsed = normalizeContactLink(body.contactLink);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    contactLink = parsed.url;
  }

  const profile = await prisma.professionalProfile.findUnique({ where: { userId } });

  if (profile) {
    if (!bio || !location) {
      return NextResponse.json({ error: "Bio and location are required." }, { status: 400 });
    }

    await Promise.all([
      prisma.user.update({ where: { id: userId }, data: { avatarUrl, contactLink } }),
      prisma.professionalProfile.update({ where: { userId }, data: { bio, location } }),
    ]);

    return NextResponse.json({ ok: true });
  }

  // --- Regular member ---
  if (bio && bio.length > MEMBER_BIO_MAX) {
    return NextResponse.json(
      { error: `Bio can't be longer than ${MEMBER_BIO_MAX} characters.` },
      { status: 400 }
    );
  }
  if (location && location.length > MEMBER_LOCATION_MAX) {
    return NextResponse.json(
      { error: `Location can't be longer than ${MEMBER_LOCATION_MAX} characters.` },
      { status: 400 }
    );
  }

  const validKeys = new Set(CRAFTS.map((c) => c.key));
  const interests = Array.isArray(body?.interests)
    ? [...new Set(body.interests.filter((k) => validKeys.has(k)))]
    : undefined;

  // Optional one-line goal per selected interest. Only keys that are
  // actually selected are kept; blanks are dropped.
  let interestGoals;
  if (interests) {
    const raw =
      body?.interestGoals && typeof body.interestGoals === "object" ? body.interestGoals : {};
    interestGoals = {};
    for (const key of interests) {
      const text = typeof raw[key] === "string" ? raw[key].trim().slice(0, GOAL_MAX) : "";
      if (text) interestGoals[key] = text;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl,
      bio: bio || null,
      location: location || null,
      interests,
      interestGoals,
      contactLink,
    },
  });

  return NextResponse.json({ ok: true });
}