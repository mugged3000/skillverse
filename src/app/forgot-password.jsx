import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { getSessionUserId } from "@/lib/auth";

export const metadata = {
  title: "Forgot password — SkillVerse",
  description: "Reset your SkillVerse password.",
};

export default async function ForgotPasswordPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/feed");

  return <ForgotPasswordForm />;
}