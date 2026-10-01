"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

const POLL_MS = 30000;

// Bell icon with an unread badge. Checks for new notifications every
// 30s (and whenever the tab becomes visible again). Renders nothing for
// logged-out visitors.
export default function NotificationBell() {
  const [count, setCount] = useState(null); // null = not loaded / logged out

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/server/notifications/unread-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(data.count);
      } catch {
        // offline / server hiccup — keep the last known count
      }
    }

    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("notifications:updated", load);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("notifications:updated", load);
    };
  }, []);

  if (count === null) return null;

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
      className="relative grid place-items-center w-9 h-9 rounded-full border border-thread/15 text-thread/70 hover:text-canvas hover:border-thread/30 transition-colors"
    >
      <Bell size={16} strokeWidth={1.9} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}