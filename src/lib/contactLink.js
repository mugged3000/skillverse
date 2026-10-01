// Helpers for the optional "reach me here" link on a profile.

const MAX_LENGTH = 200;
const INVALID = "That doesn't look like a valid link or phone number.";

// Accepts a phone number (turned into a WhatsApp link) or any web link
// (Instagram, Telegram, a website...). Returns { url } — url is null when
// the field was left blank — or { error }. Only http(s) links are ever
// accepted, so a "javascript:" link can't be stored.
export function normalizeContactLink(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return { url: null };
  if (raw.length > MAX_LENGTH) return { error: `Link can't be longer than ${MAX_LENGTH} characters.` };

  // Looks like a phone number -> wa.me link. A leading 0 is treated as a
  // Nigerian number (0803... -> 234803...); a leading + is kept as typed.
  if (/^\+?[\d\s\-()]{7,}$/.test(raw)) {
    let digits = raw.replace(/\D/g, "");
    if (!raw.startsWith("+") && digits.startsWith("0")) digits = "234" + digits.slice(1);
    if (digits.length < 8 || digits.length > 15) return { error: INVALID };
    return { url: `https://wa.me/${digits}` };
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let parsed;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { error: INVALID };
  }
  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname.includes(".")) {
    return { error: INVALID };
  }
  return { url: parsed.toString() };
}

// Button text based on where the link points.
export function contactLabel(url) {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "Get in touch";
  }
  if (host === "wa.me" || host.endsWith("whatsapp.com")) return "Chat on WhatsApp";
  if (host === "t.me" || host.endsWith("telegram.me") || host.endsWith("telegram.org")) return "Message on Telegram";
  if (host.endsWith("instagram.com")) return "Message on Instagram";
  if (host === "m.me" || host.endsWith("facebook.com") || host.endsWith("messenger.com")) return "Message on Facebook";
  if (host.endsWith("x.com") || host.endsWith("twitter.com")) return "Message on X";
  return "Get in touch";
}