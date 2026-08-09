import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

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
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name: trimmedName, email: trimmedEmail, passwordHash },
  });

  await createSession(user.id);

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}