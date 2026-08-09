import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "sv_session";
const SESSION_DAYS = 30;

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Add a long random string to your .env file."
    );
  }
  return new TextEncoder().encode(secret);
}

// Call ONLY from a Route Handler (like /api/auth/login) or a Server
// Action — never from a page/Server Component. Signs a JWT with the
// user's id and sets it as an httpOnly cookie.
export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

// Safe to call from ANYWHERE — pages, Route Handlers, Server Actions.
// Only reads the cookie, never writes to it.
export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.userId;
  } catch {
    return null;
  }
}

// Call ONLY from a Route Handler or a Server Action — clears the
// session cookie, logging the user out.
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}