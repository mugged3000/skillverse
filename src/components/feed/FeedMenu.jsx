"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Home,
  Search,
  UserCircle,
  Sparkles,
  Info,
  LogOut,
  ArrowLeft,
} from "lucide-react";

// The app-area hamburger menu — sits where the old inline "Log out"
// button used to be. Log out lives inside it now, alongside a few
// other real destinations in the app rather than being the only
// action available from the header.
export default function FeedMenu({ isProfessional, viewerId, showBackToFeed = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (toggleRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useGSAP(
    () => {
      if (!menuRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (open) {
        tl.set(menuRef.current, { pointerEvents: "auto" })
          .fromTo(
            menuRef.current,
            { autoAlpha: 0, scale: 0.94, y: -8 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.35 },
            0
          )
          .fromTo(
            itemRefs.current,
            { autoAlpha: 0, x: 6 },
            { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" },
            "-=0.18"
          );
      } else {
        tl.to(menuRef.current, { autoAlpha: 0, scale: 0.96, y: -6, duration: 0.2, ease: "power2.in" }).set(
          menuRef.current,
          { pointerEvents: "none" }
        );
      }
    },
    { dependencies: [open] }
  );

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/server/auth/logout", { method: "POST" });
    } finally {
      setOpen(false);
      router.push("/login");
      router.refresh();
    }
  }

  const items = [];

  if (showBackToFeed) {
    items.push({ href: "/feed", label: "Back to feed", icon: ArrowLeft });
  } else {
    items.push({ href: "/feed", label: "Feed", icon: Home });
  }

  items.push({ href: "/professionals", label: "Discover professionals", icon: Search });

  if (isProfessional && viewerId) {
    items.push({ href: `/professionals/${viewerId}`, label: "My profile", icon: UserCircle });
   } else {
    if (viewerId) {
      items.push({ href: `/members/${viewerId}`, label: "My profile", icon: UserCircle });
    }
    if (!showBackToFeed) {
      items.push({ href: "/become-professional", label: "Become a professional", icon: Sparkles });
    }
  }

  items.push({ href: "/", label: "About SkillVerse", icon: Info });

  return (
    <div className="relative">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid place-items-center w-9 h-9 rounded-full border border-thread/15 text-thread/70 hover:text-canvas hover:border-thread/30 transition-colors"
      >
        <div className="w-4 flex flex-col gap-1">
          <span
            className={
              "h-px bg-current transition-transform " + (open ? "translate-y-1.5 rotate-45" : "")
            }
          />
          <span className={"h-px bg-current transition-opacity " + (open ? "opacity-0" : "")} />
          <span
            className={
              "h-px bg-current transition-transform " + (open ? "-translate-y-1.5 -rotate-45" : "")
            }
          />
        </div>
      </button>

      <div
        ref={menuRef}
        role="menu"
        aria-hidden={!open}
        style={{ transformOrigin: "top right", pointerEvents: "none" }}
        className="invisible opacity-0 absolute right-0 top-full mt-3 z-30 w-64 rounded-2xl border border-thread/10 bg-ink-soft shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)] p-2"
      >
        <nav className="flex flex-col">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href + item.label}
                ref={(el) => (itemRefs.current[i] = el)}
                href={item.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-thread/80 hover:text-canvas hover:bg-thread/5 transition-colors"
              >
                <Icon size={16} strokeWidth={1.75} className="text-gold-light" />
                {item.label}
              </Link>
            );
          })}

          <div className="my-1.5 border-t border-thread/10" />

          <button
            ref={(el) => (itemRefs.current[items.length] = el)}
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-thread/70 hover:text-clay-light hover:bg-clay/5 transition-colors disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.75} />
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </nav>
      </div>
    </div>
  );
}
