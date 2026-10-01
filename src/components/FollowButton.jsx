"use client";

import { useState } from "react";

export default function FollowButton({ targetUserId, initiallyFollowing, followLabel = "Follow" }) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [loading, setLoading] = useState(false);

  async function toggleFollow() {
    if (loading) return;

    // Optimistic update — flip immediately, undo if the request fails.
    const next = !following;
    setFollowing(next);
    setLoading(true);

    try {
      const res = await fetch(`/server/follow/${targetUserId}`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
    } catch {
      setFollowing(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={loading}
      className={
        "rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 " +
        (following
          ? "border border-thread/20 text-thread/70 hover:border-clay/40 hover:text-clay-light"
          : "bg-gold text-ink hover:bg-gold-light")
      }
    >
      {following ? "Following" : followLabel}
    </button>
  );
}