import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

// Toggle like: if the viewer already liked this post, remove it;
// otherwise add it. One request does both directions.
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const { postId } = await params;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { postId, userId } });
  return NextResponse.json({ liked: true });
}