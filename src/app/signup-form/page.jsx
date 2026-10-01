import { redirect } from "next/navigation";
import SignUpForm from "@/components/SignUpForm";
import { getSessionUserId } from "@/lib/auth";

export const metadata = {
  title: "Sign up — SkillVerse",
  description: "Create your free SkillVerse account and start booking or listing skilled hands near you.",
};

export default async function SignUpPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/feed");

  return <SignUpForm />;
}