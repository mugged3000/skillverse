import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

// At least one lowercase letter, one uppercase letter, and one digit —
// same rule as signup, so a reset password is never weaker than a
// fresh one.
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const password = body?.password;

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Missing or invalid reset link." }, { status: 400 });
  }

  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Enter a new password." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  if (!PASSWORD_RE.test(password)) {
    return NextResponse.json(
      { error: "Password must include an uppercase letter, a lowercase letter, and a number." },
      { status: 400 }
    );
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return NextResponse.json(
      { error: "Password must be no more than 72 characters." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user) {
    return NextResponse.json(
      { error: "That reset link isn't valid. Request a new one.", code: "INVALID_TOKEN" },
      { status: 400 }
    );
  }

  if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return NextResponse.json(
      { error: "That reset link has expired. Request a new one.", code: "EXPIRED_TOKEN" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  // Resetting a password is proof of identity — log them straight in
  // rather than sending them to the login form right after.
  await createSession(user.id);

  return NextResponse.json({ status: "reset" });
}