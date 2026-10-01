import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import { notify, removeNotification, NOTIFY } from "@/lib/notify";

export async function POST(req, { params }) {
  const followerId = await getSessionUserId();
  if (!followerId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const { userId: followingId } = await params;

  if (followerId === followingId) {
    return NextResponse.json({ error: "You can't follow yourself." }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    await removeNotification({ recipientId: followingId, actorId: followerId, type: NOTIFY.FOLLOW });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerId, followingId } });
  await notify({ recipientId: followingId, actorId: followerId, type: NOTIFY.FOLLOW });
  return NextResponse.json({ following: true });
}