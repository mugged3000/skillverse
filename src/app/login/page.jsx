import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSessionUserId } from "@/lib/auth";

export const metadata = {
  title: "Log in — SkillVerse",
  description: "Log in to your SkillVerse account.",
};

export default async function LoginPage() {
  // Already have a valid session (e.g. an old bookmark, or the "Sign
  // in" link from before Navbar knew they were logged in) — send them
  // straight to the feed instead of making them look at a login form
  // for an account they're already in.
  const userId = await getSessionUserId();
  if (userId) redirect("/feed");

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}