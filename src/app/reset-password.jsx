import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = {
  title: "Reset password — SkillVerse",
  description: "Choose a new SkillVerse password.",
};

// No session-redirect guard here (unlike login/forgot-password) — a
// signed-in user might still be the one clicking a reset link from
// their email, e.g. on another device.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}