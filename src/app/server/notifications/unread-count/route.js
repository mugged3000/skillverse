import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";

// Powers the red badge on the bell.
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const count = await prisma.notification.count({
    where: { recipientId: userId, read: false },
  });

  return NextResponse.json({ count });
}