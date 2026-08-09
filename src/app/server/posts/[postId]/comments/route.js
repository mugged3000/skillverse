import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

export async function GET(req, { params }) {
  const { postId } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({
    comments: comments.map((c) => ({
      id: c.id,
      text: c.text,
      authorName: c.author.name,
    })),
  });
}

export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const { postId } = await params;
  const body = await req.json().catch(() => null);
  const text = body?.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { postId, authorId: userId, text },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({
    comment: { id: comment.id, text: comment.text, authorName: comment.author.name },
  });
}