import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

// Creates a real post. Only professionals can post — matches the
// product idea (this is a platform for showing craft work, not a
// general social feed).
export async function POST(req) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const profile = await prisma.professionalProfile.findUnique({ where: { userId } });
  if (!profile) {
    return NextResponse.json(
      { error: "Only professionals can post. Set up your profile first." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const imageUrl = body?.imageUrl?.trim();
  const caption = body?.caption?.trim() || null;
  const mediaType = body?.mediaType === "video" ? "video" : "image";

  if (!imageUrl) {
    return NextResponse.json({ error: "A photo or video is required." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: { authorId: userId, imageUrl, mediaType, caption },
  });

  return NextResponse.json({ id: post.id }, { status: 201 });
}