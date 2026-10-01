"use client";

/*
  Forgot password — mirrors LoginForm.jsx's layout and animation so it
  feels like the same system. Just an email field; always shows the
  same generic "check your inbox" success state whether or not the
  email has an account, since /server/auth/forgot-password never
  reveals that either.
*/

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MailCheck } from "lucide-react";
import AuthBrandPanel from "./auth/AuthBrandPanel";

export default function ForgotPasswordForm() {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const fieldRefs = useRef([]);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | sent

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(panelRef.current, { autoAlpha: 0, x: -24, duration: 0.8 }).from(
        fieldRefs.current,
        { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.08 },
        "-=0.5"
      );
    },
    { scope: rootRef }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      return;
    }
    setError("");
    setStatus("submitting");
    try {
      const res = await fetch("/server/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json().catch(() => null);
      setStatus("sent");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  };

  return (
    <main ref={rootRef} className="min-h-dvh grid lg:grid-cols-2 bg-ink">
      <AuthBrandPanel
        ref={panelRef}
        image="/images/banner1.jpg"
        quote="“My regulars book straight from my SkillVerse page now — no more back-and-forth on DM.”"
        attribution="TUNDE · BARBER · IKEJA"
      />

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/login"
            ref={(el) => (fieldRefs.current[0] = el)}
            className="inline-flex items-center gap-1.5 text-sm text-thread/60 hover:text-canvas transition-colors"
          >
            ← Back to log in
          </Link>

          {status === "sent" ? (
            <div ref={(el) => (fieldRefs.current[1] = el)} className="mt-10">
              <span className="grid place-items-center w-11 h-11 rounded-full bg-gold/15 text-gold-light">
                <MailCheck size={20} strokeWidth={1.75} />
              </span>
              <h1 className="mt-5 font-display font-semibold text-3xl text-canvas">
                Check your inbox
              </h1>
              <p className="mt-3 text-thread/70 leading-relaxed">
                If <span className="text-canvas">{email}</span> has a SkillVerse account, a
                password reset link is on its way. It expires in an hour.
              </p>
            </div>
          ) : (
            <>
              <h1
                ref={(el) => (fieldRefs.current[1] = el)}
                className="mt-8 font-display font-semibold text-3xl text-canvas"
              >
                Forgot your password?
              </h1>
              <p ref={(el) => (fieldRefs.current[2] = el)} className="mt-2 text-thread/60">
                Enter the email on your account and we&rsquo;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div ref={(el) => (fieldRefs.current[3] = el)}>
                  <label htmlFor="email" className="block text-sm text-thread/80 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                    placeholder="you@example.com"
                  />
                  {error && <p className="mt-1.5 text-xs text-clay-light">{error}</p>}
                </div>

                <button
                  ref={(el) => (fieldRefs.current[4] = el)}
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-full bg-gold text-ink font-semibold py-3.5 hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}