import crypto from "crypto";

const VERIFICATION_TOKEN_TTL_HOURS = 24;
const RESET_TOKEN_TTL_MINUTES = 60;

// URL-safe random token — long enough that guessing it isn't feasible.
export function generateVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000);
  return { token, expiresAt };
}

// Same shape as the verification token, but short-lived (1 hour) —
// password reset links are more sensitive to hang around unused.
export function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  return { token, expiresAt };
}