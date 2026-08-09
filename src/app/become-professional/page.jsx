import { redirect } from "next/navigation";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import BecomeProfessionalForm from "@/components/BecomeProfessionalForm";

export default async function BecomeProfessionalPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const existing = await prisma.professionalProfile.findUnique({ where: { userId } });
  if (existing) redirect("/feed");

  return (
    <main className="min-h-dvh bg-ink px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="font-display font-semibold text-3xl text-canvas">
          Become a professional
        </h1>
        <p className="mt-2 text-thread/60">
          You&rsquo;ll keep everything you can already do — browsing,
          liking, booking others — plus a profile people can find and
          book you through.
        </p>

        <BecomeProfessionalForm />
      </div>
    </main>
  );
}