"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LINKS } from "@/lib/navLinks";
import ProsMenu from "./nav/ProsMenu";
import MobileMenu from "./nav/MobileMenu";

export default function Navbar({ isLoggedIn = false }) {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Navbar entrance — drops in once on mount, links stagger in after it.
  // ".nav-link" also matches links rendered by ProsMenu/MobileMenu
  // since they're still DOM descendants of this header — splitting
  // those out doesn't change what this selector finds.
  useGSAP(
    () => {
      gsap.from(navRef.current, {
        y: -24,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.from(".nav-link", {
        y: -8,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        delay: 0.35,
      });
    },
    { scope: navRef }
  );

  return (
    <header
      ref={navRef}
      data-nav
      className={
        "fixed top-0 inset-x-0 z-50 transition-colors duration-500 " +
        (scrolled ? "bg-ink/85 backdrop-blur-md border-b border-thread/10" : "bg-transparent")
      }
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between h-18 py-4">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="relative grid place-items-center w-9 h-9 rounded-full bg-gold text-ink font-display font-bold text-sm">
            Sv
            <span className="absolute inset-0 rounded-full border border-gold-light/60 scale-100 group-hover:scale-125 transition-transform duration-500" />
          </span>
          <span className="font-display font-semibold text-lg tracking-tight text-canvas">
            SkillVerse
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) =>
            l.href === "#pros" ? (
              <ProsMenu key={l.href} />
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="nav-link text-sm text-thread/70 hover:text-gold-light transition-colors"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <a
              href="/feed"
              className="nav-link text-sm font-semibold bg-gold text-ink px-4 py-2.5 rounded-full hover:bg-gold-light transition-colors"
            >
              Go to feed
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="nav-link text-sm text-thread/80 hover:text-canvas transition-colors px-3 py-2"
              >
                Sign in
              </a>
              <a
                href="/signup-form"
                className="nav-link text-sm font-semibold bg-gold text-ink px-4 py-2.5 rounded-full hover:bg-gold-light transition-colors"
              >
                Join free
              </a>
            </>
          )}
        </div>

        <MobileMenu isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}