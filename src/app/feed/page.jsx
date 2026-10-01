import { redirect } from "next/navigation";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";
import UserSearch from "@/components/feed/UserSearch";
// export const dynamic = "force-dynamic";
// The main feed — same for every logged-in user, whether or not they've
// become a professional. Server-rendered: fetch posts + whether the
// current viewer already liked each one, then hand off to a client
// component for the interactive bits (like/comment).
//
// This is a members-only page — no session (missing or expired) sends
// the visitor to /login with a reason, rather than quietly rendering a
// read-only "guest" version of the dashboard.
export default async function FeedPage() {
  const viewerId = await getSessionUserId();
  if (!viewerId) redirect("/login?reason=session_expired");

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: viewerId }, select: { id: true } },
    },
  });

  const feedPosts = posts.map((post) => ({
    id: post.id,
    imageUrl: post.imageUrl,
    mediaType: post.mediaType,
    caption: post.caption,
    authorId: post.author.id,
    authorName: post.author.name,
    authorAvatarUrl: post.author.avatarUrl,
    createdAt: post.createdAt,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByViewer: post.likes.length > 0,
  }));

  const professionalProfile = await prisma.professionalProfile.findUnique({
    where: { userId: viewerId },
  });

  return (
    <main className="min-h-dvh bg-ink relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] w-[520px] h-[520px] rounded-full bg-emerald/15 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[40%] left-[-15%] w-[440px] h-[440px] rounded-full bg-gold/10 blur-[140px]"
      />

      <FeedHeader isProfessional={Boolean(professionalProfile)} viewerId={viewerId} />

      <div className="relative mx-auto max-w-xl px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold-light">
            Your feed
          </p>
          <h1 className="font-display font-semibold text-3xl text-canvas mt-1.5">
            What the guild&rsquo;s been making.
          </h1>
        </div>

        <div className="mb-8">
          <UserSearch />
        </div>

        <FeedList posts={feedPosts} isLoggedIn />
      </div>
    </main>
  );
}