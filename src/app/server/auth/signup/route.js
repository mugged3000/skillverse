import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { hashPassword } from "@/lib/password";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

// At least one lowercase letter, one uppercase letter, and one digit.
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { name, email, password } = body;

  // Type checks first — .trim() on a non-string throws and would 500 the route.
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "Name, email and password are all required." },
      { status: 400 }
    );
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !password) {
    return NextResponse.json(
      { error: "Name, email and password are all required." },
      { status: 400 }
    );
  }

  if (trimmedName.length < 2 || trimmedName.length > 80) {
    return NextResponse.json(
      { error: "Name must be between 2 and 80 characters." },
      { status: 400 }
    );
  }

  if (trimmedEmail.length > 254 || !EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
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

  // bcrypt only hashes the first 72 bytes — anything past that is silently
  // ignored, so a very long password wouldn't hash the way the user expects.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return NextResponse.json(
      { error: "Password must be no more than 72 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: trimmedEmail },
    select: { id: true, name: true, email: true, emailVerified: true },
  });

  if (existing && existing.emailVerified) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  // Someone signed up before but never clicked the link — instead of a
  // dead-end "already exists" error, just re-send a fresh verification
  // email so they can finish the account they already started.
  if (existing && !existing.emailVerified) {
    const { token, expiresAt } = generateVerificationToken();
    await prisma.user.update({
      where: { id: existing.id },
      data: { verificationToken: token, verificationTokenExpiresAt: expiresAt },
    });

    const verifyUrl = new URL(
      `/server/auth/verify-email?token=${token}`,
      req.url
    ).toString();
    const result = await sendVerificationEmail({ to: existing.email, name: existing.name, verifyUrl });

    return NextResponse.json({
      status: "verification-sent",
      email: existing.email,
      // Only ever populated outside production, and only because no
      // mail provider is configured — see src/lib/mail.js. Lets local
      // development/testing proceed without real email delivery,
      // instead of silently claiming an email was sent when it wasn't.
      devVerifyUrl:
        !result.delivered && process.env.NODE_ENV !== "production" ? verifyUrl : undefined,
    });
  }

  const passwordHash = await hashPassword(password);
  const { token, expiresAt } = generateVerificationToken();

  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
    },
  });

  const verifyUrl = new URL(`/server/auth/verify-email?token=${token}`, req.url).toString();
  const result = await sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });

  // No session is created here — the account exists but is unusable
  // until the email link is clicked. Login is blocked on emailVerified.
  return NextResponse.json({
    status: "verification-sent",
    email: user.email,
    devVerifyUrl:
      !result.delivered && process.env.NODE_ENV !== "production" ? verifyUrl : undefined,
  });
}