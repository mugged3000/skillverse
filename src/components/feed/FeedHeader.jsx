"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function FeedHeader({ isProfessional }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/server/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-thread/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto max-w-xl flex items-center justify-between px-6 py-4">
        <Link href="/feed" className="flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-gold text-ink font-display font-bold text-xs">
            Sv
          </span>
          <span className="font-display font-semibold text-canvas">SkillVerse</span>
        </Link>

        <div className="flex items-center gap-4">
          {!isProfessional && (
            <Link
              href="/become-professional"
              className="text-sm font-medium text-gold-light hover:text-gold transition-colors"
            >
              Become a pro
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 text-sm text-thread/60 hover:text-clay-light transition-colors disabled:opacity-50"
          >
            <LogOut size={15} strokeWidth={1.75} />
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </div>
    </header>
  );
}