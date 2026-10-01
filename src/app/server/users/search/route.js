import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

// Name search across everyone (members and professionals) for the feed
// search bar. Login required; never returns emails.
//
// Every word you type must appear somewhere in the name, in any order,
// so "ada ok", "okafor ada" and "ada" all find "Ada Okafor". Names that
// start with what you typed are listed first.
export async function GET(req) {
  const viewerId = await getSessionUserId();
  if (!viewerId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 5);
  if (tokens.length === 0) return NextResponse.json({ users: [] });

  const found = await prisma.user.findMany({
    where: {
      AND: tokens.map((t) => ({ name: { contains: t, mode: "insensitive" } })),
    },
    take: 40,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      professionalProfile: { select: { craftKey: true } },
    },
  });

  const lowerQ = q.toLowerCase();
  const firstToken = tokens[0].toLowerCase();
  const rank = (name) => {
    const n = name.toLowerCase();
    if (n === lowerQ) return 0;
    if (n.startsWith(lowerQ)) return 1;
    if (n.split(/\s+/).some((w) => w.startsWith(firstToken))) return 2;
    return 3;
  };

  const users = found
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
    .slice(0, 10)
    .map((u) => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      craftKey: u.professionalProfile?.craftKey ?? null,
    }));

  return NextResponse.json({ users });
}