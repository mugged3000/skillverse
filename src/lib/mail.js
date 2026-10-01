// Email sender for account verification and password reset.
//
// Uses Nodemailer over SMTP. Configure these in your .env:
//   SMTP_HOST="smtp.gmail.com"
//   SMTP_PORT="587"
//   SMTP_SECURE="false"          // "true" if using port 465
//   SMTP_USER="you@example.com"
//   SMTP_PASS="your-smtp-password-or-app-password"
//   EMAIL_FROM="SkillVerse <you@example.com>"
//
// If SMTP isn't configured, we don't fail the calling request — we
// fall back to logging the link to the server console instead,
// clearly labelled, so local development keeps working without a
// mail provider set up.
import nodemailer from "nodemailer";

let cachedTransporter = null;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  return cachedTransporter;
}

async function sendMail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM;
  const transporter = getTransporter();

  if (!transporter || !from) {
    return { delivered: false, reason: "no-provider" };
  }

  try {
    await transporter.sendMail({ from, to, subject, html });
    return { delivered: true };
  } catch (err) {
    console.error("[SkillVerse] Error sending email via nodemailer:", err);
    return { delivered: false, reason: "network-error" };
  }
}

export async function sendVerificationEmail({ to, name, verifyUrl }) {
  const subject = "Confirm your SkillVerse email";
  const html = renderVerificationEmailHtml({ name, verifyUrl });

  const result = await sendMail({ to, subject, html });

  if (!result.delivered) {
    console.log(
      `\n[SkillVerse] Email not delivered (${result.reason}).\n` +
        `Verification link for ${to}:\n${verifyUrl}\n`
    );
  }

  return result;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const subject = "Reset your SkillVerse password";
  const html = renderPasswordResetEmailHtml({ name, resetUrl });

  const result = await sendMail({ to, subject, html });

  if (!result.delivered) {
    console.log(
      `\n[SkillVerse] Email not delivered (${result.reason}).\n` +
        `Password reset link for ${to}:\n${resetUrl}\n`
    );
  }

  return result;
}

function renderVerificationEmailHtml({ name, verifyUrl }) {
  return `
  <div style="font-family: -apple-system, Segoe UI, sans-serif; background:#14110f; padding:32px; color:#efe6d8;">
    <div style="max-width:480px; margin:0 auto; background:#1d1915; border-radius:16px; padding:32px; border:1px solid rgba(239,230,216,0.1);">
      <p style="font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#f0c675; margin:0 0 12px;">SkillVerse</p>
      <h1 style="font-size:22px; margin:0 0 16px; color:#faf6ee;">Confirm your email</h1>
      <p style="font-size:14px; line-height:1.6; color:rgba(239,230,216,0.75); margin:0 0 24px;">
        Hi ${escapeHtml(name)}, welcome to SkillVerse. Click the button below to verify
        your email address and finish creating your account. This link expires in 24 hours.
      </p>
      <a href="${verifyUrl}" style="display:inline-block; background:#d9a441; color:#14110f; font-weight:600; text-decoration:none; padding:12px 24px; border-radius:999px; font-size:14px;">
        Verify my email
      </a>
      <p style="font-size:12px; line-height:1.6; color:rgba(239,230,216,0.45); margin:24px 0 0;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <span style="word-break:break-all;">${verifyUrl}</span>
      </p>
      <p style="font-size:12px; color:rgba(239,230,216,0.4); margin:16px 0 0;">
        Didn&rsquo;t sign up for SkillVerse? You can ignore this email.
      </p>
    </div>
  </div>`;
}

function renderPasswordResetEmailHtml({ name, resetUrl }) {
  return `
  <div style="font-family: -apple-system, Segoe UI, sans-serif; background:#14110f; padding:32px; color:#efe6d8;">
    <div style="max-width:480px; margin:0 auto; background:#1d1915; border-radius:16px; padding:32px; border:1px solid rgba(239,230,216,0.1);">
      <p style="font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#f0c675; margin:0 0 12px;">SkillVerse</p>
      <h1 style="font-size:22px; margin:0 0 16px; color:#faf6ee;">Reset your password</h1>
      <p style="font-size:14px; line-height:1.6; color:rgba(239,230,216,0.75); margin:0 0 24px;">
        Hi ${escapeHtml(name)}, we got a request to reset your SkillVerse password. Click the
        button below to choose a new one. This link expires in 1 hour.
      </p>
      <a href="${resetUrl}" style="display:inline-block; background:#d9a441; color:#14110f; font-weight:600; text-decoration:none; padding:12px 24px; border-radius:999px; font-size:14px;">
        Reset my password
      </a>
      <p style="font-size:12px; line-height:1.6; color:rgba(239,230,216,0.45); margin:24px 0 0;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <span style="word-break:break-all;">${resetUrl}</span>
      </p>
      <p style="font-size:12px; color:rgba(239,230,216,0.4); margin:16px 0 0;">
        Didn&rsquo;t request a password reset? You can safely ignore this email — your password
        won&rsquo;t change.
      </p>
    </div>
  </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}