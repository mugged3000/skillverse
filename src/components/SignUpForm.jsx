"use client";

/*
  General sign-up — one form, one account type. No "are you a client or
  a pro" branch: everyone lands here the same way, and role/craft setup
  (if any) happens later inside the product, not at the door.

  Wired to /server/auth/signup — creates the account, hashes the
  password, and emails a verification link. No session is created yet:
  the account can't log in until that link is clicked, so this form
  shows a "check your email" state instead of redirecting to /feed.
*/

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { Eye, EyeOff, MailCheck } from "lucide-react";
import AuthBrandPanel from "./auth/AuthBrandPanel";

export default function SignUpForm() {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const fieldRefs = useRef([]);

  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent
  const [devVerifyUrl, setDevVerifyUrl] = useState(null);

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

  const onChange = (field) => (e) =>
    setValues((v) => ({ ...v, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email.";
    if (values.password.length < 8) next.password = "At least 8 characters.";
    if (!agreed) next.agreed = "You need to agree to continue.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/server/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || "Something went wrong. Try again." });
        setStatus("idle");
        return;
      }

      setStatus("success");
      setDevVerifyUrl(data.devVerifyUrl || null);
    } catch {
      setErrors({ form: "Couldn't reach the server. Check your connection and try again." });
      setStatus("idle");
    }
  };

  const handleResend = async () => {
    if (resendStatus === "sending") return;
    setResendStatus("sending");
    try {
      const res = await fetch("/server/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await res.json().catch(() => null);
      setDevVerifyUrl(data?.devVerifyUrl || null);
    } finally {
      setResendStatus("sent");
    }
  };

  return (
    <main ref={rootRef} className="min-h-dvh grid lg:grid-cols-2 bg-ink">
      <AuthBrandPanel
        ref={panelRef}
        image="/images/banner.jpg"
        quote="“I went from five clients a week to thirty in two months.”"
        attribution="CHIOMA · NAIL TECH · YABA"
      />

      {/* Right — form */}
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            ref={(el) => (fieldRefs.current[0] = el)}
            className="inline-flex items-center gap-1.5 text-sm text-thread/60 hover:text-canvas transition-colors"
          >
            ← Back to SkillVerse
          </Link>

          {status === "success" ? (
            <div ref={(el) => (fieldRefs.current[1] = el)} className="mt-10">
              <span className="grid place-items-center w-12 h-12 rounded-full bg-gold/15 text-gold-light">
                <MailCheck size={22} strokeWidth={1.75} />
              </span>
              <h1 className="mt-5 font-display font-semibold text-3xl text-canvas">
                Check your email.
              </h1>
              <p className="mt-3 text-thread/70 leading-relaxed">
                We sent a verification link to{" "}
                <span className="text-canvas">{values.email}</span>. Click it to
                activate your account — you&rsquo;ll be signed in automatically.
              </p>
              <p className="mt-6 text-sm text-thread/50">
                Didn&rsquo;t get it? Check spam, or{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || resendStatus === "sent"}
                  className="text-gold-light hover:text-gold transition-colors disabled:opacity-60"
                >
                  {resendStatus === "sending"
                    ? "sending…"
                    : resendStatus === "sent"
                    ? "sent — check your inbox"
                    : "resend the link"}
                </button>
                .
              </p>

              {devVerifyUrl && (
                <div className="mt-5 text-sm rounded-lg px-3.5 py-3 border border-gold/25 bg-gold/10 space-y-2">
                  <p className="text-thread/80">
                    Email delivery isn&rsquo;t configured on this server yet, so no email
                    actually went out. For now, verify instantly here instead:
                  </p>
                  <a
                    href={devVerifyUrl}
                    className="inline-block text-sm font-semibold text-gold-light hover:text-gold transition-colors break-all"
                  >
                    {devVerifyUrl}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <h1
                ref={(el) => (fieldRefs.current[1] = el)}
                className="mt-8 font-display font-semibold text-3xl text-canvas"
              >
                Create your account
              </h1>
              <p ref={(el) => (fieldRefs.current[2] = el)} className="mt-2 text-thread/60">
                Free to join. Book a pro or list your own craft, whichever you need.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div ref={(el) => (fieldRefs.current[3] = el)}>
                  <label htmlFor="name" className="block text-sm text-thread/80 mb-1.5">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={values.name}
                    onChange={onChange("name")}
                    autoComplete="name"
                    className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                    placeholder="Ada Chukwu"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-clay-light">{errors.name}</p>}
                </div>

                <div ref={(el) => (fieldRefs.current[4] = el)}>
                  <label htmlFor="email" className="block text-sm text-thread/80 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={onChange("email")}
                    autoComplete="email"
                    className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-clay-light">{errors.email}</p>}
                </div>

                <div ref={(el) => (fieldRefs.current[5] = el)}>
                  <label htmlFor="password" className="block text-sm text-thread/80 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={onChange("password")}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 pr-11 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-clay-light">{errors.password}</p>
                  )}
                </div>

                <div ref={(el) => (fieldRefs.current[6] = el)}>
                  <label className="flex items-start gap-2.5 text-sm text-thread/70">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-thread/30 bg-ink-soft accent-gold"
                    />
                    I agree to SkillVerse&rsquo;s Terms and Privacy Policy.
                  </label>
                  {errors.agreed && (
                    <p className="mt-1.5 text-xs text-clay-light">{errors.agreed}</p>
                  )}
                </div>

                {errors.form && (
                  <p
                    ref={(el) => (fieldRefs.current[7] = el)}
                    className="text-sm text-clay-light bg-clay/10 border border-clay/30 rounded-lg px-3 py-2.5"
                  >
                    {errors.form}
                  </p>
                )}

                <button
                  ref={(el) => (fieldRefs.current[8] = el)}
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-full bg-gold text-ink font-semibold py-3.5 hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {status === "submitting" ? "Creating account…" : "Create account"}
                </button>
              </form>

              <p ref={(el) => (fieldRefs.current[9] = el)} className="mt-6 text-center text-sm text-thread/60">
                Already have an account?{" "}
                <Link href="/login" className="text-gold-light hover:text-gold transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}