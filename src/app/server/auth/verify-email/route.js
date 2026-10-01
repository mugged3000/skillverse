import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { createSession } from "@/lib/auth";

// Visited by clicking the link in the verification email — a plain
// GET link, not a fetch call, since it's opened straight from an
// email client. Redirects the browser to a friendly page in every
// case rather than returning raw JSON.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });

  if (!user) {
    return NextResponse.redirect(new URL("/login?verify=invalid", req.url));
  }

  if (user.emailVerified) {
    // Already verified (e.g. the link was clicked twice) — just send
    // them to log in instead of erroring.
    return NextResponse.redirect(new URL("/login?verify=already", req.url));
  }

  if (!user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?verify=expired", req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

  // Verifying is also proof of identity — log them straight in rather
  // than making them re-enter their password right after.
  await createSession(user.id);

  return NextResponse.redirect(new URL("/feed?justVerified=1", req.url));
}
