import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

// Only the comment's own author can delete it. Deleting a top-level
// comment also deletes its replies (onDelete: Cascade in the schema).
export async function DELETE(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const { postId, commentId } = await params;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.postId !== postId) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  if (comment.authorId !== userId) {
    return NextResponse.json(
      { error: "You can only delete your own comments." },
      { status: 403 }
    );
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.json({ deleted: true, parentId: comment.parentId });
}