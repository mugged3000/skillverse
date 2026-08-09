"use client";

/*
  Log in — mirrors SignUpForm.jsx's layout and animation so the two auth
  screens feel like one system, just fewer fields.

  Wired to /server/auth/login — verifies the password and logs the user
  in (session cookie) on success, then redirects to /feed.
*/

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthBrandPanel from "./auth/AuthBrandPanel";

export default function LoginForm() {
  const router = useRouter();
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const fieldRefs = useRef([]);

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [showPassword, setShowPassword] = useState(false);

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email.";
    if (!values.password) next.password = "Enter your password.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/server/auth/login", {
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
      router.push("/feed");
    } catch {
      setErrors({ form: "Couldn't reach the server. Check your connection and try again." });
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
              <h1 className="font-display font-semibold text-3xl text-canvas">You&rsquo;re signed in.</h1>
              <p className="mt-3 text-thread/70 leading-relaxed">
                Welcome back.
              </p>
            </div>
          ) : (
            <>
              <h1
                ref={(el) => (fieldRefs.current[1] = el)}
                className="mt-8 font-display font-semibold text-3xl text-canvas"
              >
                Welcome back
              </h1>
              <p ref={(el) => (fieldRefs.current[2] = el)} className="mt-2 text-thread/60">
                Log in to your SkillVerse account.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div ref={(el) => (fieldRefs.current[3] = el)}>
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

                <div ref={(el) => (fieldRefs.current[4] = el)}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm text-thread/80">
                      Password
                    </label>
                    <a href="#" className="text-xs text-gold-light hover:text-gold transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={onChange("password")}
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 pr-11 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                      placeholder="Your password"
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

                {errors.form && (
                  <p
                    ref={(el) => (fieldRefs.current[5] = el)}
                    className="text-sm text-clay-light bg-clay/10 border border-clay/30 rounded-lg px-3 py-2.5"
                  >
                    {errors.form}
                  </p>
                )}

                <button
                  ref={(el) => (fieldRefs.current[6] = el)}
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-full bg-gold text-ink font-semibold py-3.5 hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {status === "submitting" ? "Signing in…" : "Log in"}
                </button>
              </form>

              <p ref={(el) => (fieldRefs.current[7] = el)} className="mt-6 text-center text-sm text-thread/60">
                Don&rsquo;t have an account?{" "}
                <Link href="/signup-form" className="text-gold-light hover:text-gold transition-colors">
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}