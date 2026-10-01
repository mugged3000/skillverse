import Link from "next/link";
import FeedMenu from "./FeedMenu";
import NotificationBell from "./NotificationBell";

// Shared header for the logged-in area of the app (feed + profile
// pages) — not the public marketing Navbar, which always shows
// "Sign in / Join free" and would be wrong once someone's logged in.
//
// The right side is a single hamburger menu (FeedMenu) rather than a
// row of separate links + a bare "Log out" button — it holds "Back to
// feed" / "Feed", "Discover professionals", "My profile" / "Become a
// professional", "About SkillVerse", and Log out, tailored by context.
export default function FeedHeader({ isProfessional, viewerId, showBackToFeed = false }) {
  return (
    <header className="sticky top-0 z-20 border-b border-thread/10 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto max-w-xl flex items-center justify-between px-6 py-4">
        <Link href="/feed" className="flex items-center gap-2">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-gold text-ink font-display font-bold text-xs">
            Sv
          </span>
          <span className="font-display font-semibold text-canvas">SkillVerse</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <NotificationBell />
          <FeedMenu isProfessional={isProfessional} viewerId={viewerId} showBackToFeed={showBackToFeed} />
        </div>
      </div>
    </header>
  );
}