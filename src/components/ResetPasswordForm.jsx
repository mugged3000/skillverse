"use client";

/*
  Reset password — the form opened from the link in the password
  reset email (?token=...). Mirrors LoginForm.jsx/SignUpForm.jsx's
  layout and animation.
*/

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthBrandPanel from "./auth/AuthBrandPanel";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const fieldRefs = useRef([]);

  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success

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

  const onChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined, form: undefined }));
  };

  const validate = () => {
    const next = {};
    if (values.password.length < 8) next.password = "At least 8 characters.";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(values.password))
      next.password = "Needs an uppercase letter, a lowercase letter, and a number.";
    if (values.confirm !== values.password) next.confirm = "Passwords don't match.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrors({ form: "This reset link is missing its token. Request a new one." });
      return;
    }
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/server/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || "Something went wrong. Try again." });
        setStatus("idle");
        return;
      }

      setStatus("success");
      router.push("/feed");
      router.refresh();
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

      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/login"
            ref={(el) => (fieldRefs.current[0] = el)}
            className="inline-flex items-center gap-1.5 text-sm text-thread/60 hover:text-canvas transition-colors"
          >
            ← Back to log in
          </Link>

          {status === "success" ? (
            <div ref={(el) => (fieldRefs.current[1] = el)} className="mt-10">
              <h1 className="font-display font-semibold text-3xl text-canvas">Password reset.</h1>
              <p className="mt-3 text-thread/70 leading-relaxed">Taking you to your feed…</p>
            </div>
          ) : (
            <>
              <h1
                ref={(el) => (fieldRefs.current[1] = el)}
                className="mt-8 font-display font-semibold text-3xl text-canvas"
              >
                Set a new password
              </h1>
              <p ref={(el) => (fieldRefs.current[2] = el)} className="mt-2 text-thread/60">
                Make it something you haven&rsquo;t used before.
              </p>

              {!token && (
                <p className="mt-4 text-sm rounded-lg px-3 py-2.5 border text-clay-light bg-clay/10 border-clay/30">
                  This link is missing its token.{" "}
                  <Link href="/forgot-password" className="underline">
                    Request a new one
                  </Link>
                  .
                </p>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div ref={(el) => (fieldRefs.current[3] = el)}>
                  <label htmlFor="password" className="block text-sm text-thread/80 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={onChange("password")}
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 pr-11 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                      placeholder="New password"
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

                <div ref={(el) => (fieldRefs.current[4] = el)}>
                  <label htmlFor="confirm" className="block text-sm text-thread/80 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    value={values.confirm}
                    onChange={onChange("confirm")}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                    placeholder="Confirm new password"
                  />
                  {errors.confirm && (
                    <p className="mt-1.5 text-xs text-clay-light">{errors.confirm}</p>
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
                  disabled={status === "submitting" || !token}
                  className="w-full rounded-full bg-gold text-ink font-semibold py-3.5 hover:bg-gold-light transition-colors disabled:opacity-60"
                >
                  {status === "submitting" ? "Resetting…" : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}