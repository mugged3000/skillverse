import prisma from "@/db/dbkey";

// Notification types. BOOKING is reserved for when appointments exist —
// call notify({ type: NOTIFY.BOOKING, ... }) from the booking route.
export const NOTIFY = {
  FOLLOW: "FOLLOW",
  POST_LIKE: "POST_LIKE",
  COMMENT: "COMMENT",
  REPLY: "REPLY",
  COMMENT_LIKE: "COMMENT_LIKE",
  BOOKING: "BOOKING",
};

export function snippet(text, max = 80) {
  const t = String(text ?? "").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

// Creates a notification for `recipientId` about something `actorId` did.
// Never throws — a failed notification must not break the like/follow/
// comment that triggered it. Skips self-notifications and exact
// duplicates (same actor, type, post and comment).
export async function notify({ recipientId, actorId, type, postId = null, commentId = null, preview = null }) {
  try {
    if (!recipientId || !actorId || recipientId === actorId) return;

    const existing = await prisma.notification.findFirst({
      where: { recipientId, actorId, type, postId, commentId },
      select: { id: true },
    });
    if (existing) return;

    await prisma.notification.create({
      data: { recipientId, actorId, type, postId, commentId, preview },
    });
  } catch (err) {
    console.error("notify failed:", err);
  }
}

// Removes the matching notification — used on unlike / unfollow so the
// recipient's bell doesn't keep an event that was taken back.
export async function removeNotification({ recipientId, actorId, type, postId = null, commentId = null }) {
  try {
    await prisma.notification.deleteMany({
      where: { recipientId, actorId, type, postId, commentId },
    });
  } catch (err) {
    console.error("removeNotification failed:", err);
  }
}