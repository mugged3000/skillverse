import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import { notify, removeNotification, NOTIFY } from "@/lib/notify";

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

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    if (post) {
      await removeNotification({ recipientId: post.authorId, actorId: userId, type: NOTIFY.POST_LIKE, postId });
    }
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { postId, userId } });
  if (post) {
    await notify({ recipientId: post.authorId, actorId: userId, type: NOTIFY.POST_LIKE, postId });
  }
  return NextResponse.json({ liked: true });
}