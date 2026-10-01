import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

// Marks everything as read (called when the notifications page opens).
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}