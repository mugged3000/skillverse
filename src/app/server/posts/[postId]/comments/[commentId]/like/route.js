import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import { notify, removeNotification, snippet, NOTIFY } from "@/lib/notify";

// Toggle like on a comment — same "one request, either direction"
// pattern as the post like route.
export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const { commentId } = await params;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
    await removeNotification({
      recipientId: comment.authorId,
      actorId: userId,
      type: NOTIFY.COMMENT_LIKE,
      postId: comment.postId,
      commentId,
    });
    return NextResponse.json({ liked: false });
  }

  await prisma.commentLike.create({ data: { commentId, userId } });
  await notify({
    recipientId: comment.authorId,
    actorId: userId,
    type: NOTIFY.COMMENT_LIKE,
    postId: comment.postId,
    commentId,
    preview: snippet(comment.text),
  });
  return NextResponse.json({ liked: true });
}