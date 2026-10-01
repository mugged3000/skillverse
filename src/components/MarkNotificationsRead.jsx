"use client";

import { useEffect } from "react";

// Mounted on the notifications page: marks everything read once the
// list is on screen, then tells the bell to refresh its badge.
export default function MarkNotificationsRead({ hasUnread }) {
  useEffect(() => {
    if (!hasUnread) return;
    (async () => {
      try {
        const res = await fetch("/server/notifications/read", { method: "POST" });
        if (res.ok) window.dispatchEvent(new Event("notifications:updated"));
      } catch {
        // not critical — they'll just stay unread until next visit
      }
    })();
  }, [hasUnread]);

  return null;
}