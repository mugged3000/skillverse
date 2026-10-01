import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

// Always responds with the same generic message whether or not the
// email exists / is already verified — this endpoint is reachable by
// anyone typing an email address in, so it shouldn't leak which
// addresses have accounts.
const GENERIC_MESSAGE =
  "If that email has a SkillVerse account waiting on verification, we've sent a new link.";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  let devVerifyUrl;

  if (user && !user.emailVerified) {
    const { token, expiresAt } = generateVerificationToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationTokenExpiresAt: expiresAt },
    });

    const verifyUrl = new URL(`/server/auth/verify-email?token=${token}`, req.url).toString();
    const result = await sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });

    // Same dev-only fallback as /server/auth/signup — see the comment
    // there. Gated behind NODE_ENV so it can never leak in production,
    // where returning this conditionally would otherwise reveal
    // whether the address has an account.
    if (!result.delivered && process.env.NODE_ENV !== "production") {
      devVerifyUrl = verifyUrl;
    }
  }

  return NextResponse.json({ message: GENERIC_MESSAGE, devVerifyUrl });
}
