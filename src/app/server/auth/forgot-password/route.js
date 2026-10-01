import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

// Always responds with the same generic message whether or not the
// email exists — this endpoint is reachable by anyone typing an email
// address in, so it shouldn't leak which addresses have accounts.
const GENERIC_MESSAGE =
  "If that email has a SkillVerse account, we've sent a link to reset the password.";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Only send a reset link for accounts that can actually log in.
  // Unverified accounts go through the verification flow instead.
  if (user && user.emailVerified) {
    const { token, expiresAt } = generatePasswordResetToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiresAt: expiresAt },
    });

    const resetUrl = new URL(`/reset-password?token=${token}`, req.url).toString();
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}