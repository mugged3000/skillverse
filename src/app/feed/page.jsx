import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import FeedHeader from "@/components/feed/FeedHeader";
import FeedList from "@/components/feed/FeedList";
import WelcomeBanner from "@/components/feed/WelcomeBanner";

// The main feed — same for every logged-in user, whether or not they've
// become a professional. Server-rendered: fetch posts + whether the
// current viewer already liked each one, then hand off to a client
// component for the interactive bits (like/comment).
export default async function FeedPage({ searchParams }) {
  const { welcome } = await searchParams;
  const viewerId = await getSessionUserId();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
      likes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
    },
  });

  const feedPosts = posts.map((post) => ({
    id: post.id,
    imageUrl: post.imageUrl,
    caption: post.caption,
    authorName: post.author.name,
    createdAt: post.createdAt,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByViewer: viewerId ? post.likes.length > 0 : false,
  }));

  const professionalProfile = viewerId
    ? await prisma.professionalProfile.findUnique({ where: { userId: viewerId } })
    : null;

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

      <FeedHeader isProfessional={Boolean(professionalProfile)} />

      <div className="relative mx-auto max-w-xl px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold-light">
            Your feed
          </p>
          <h1 className="font-display font-semibold text-3xl text-canvas mt-1.5">
            What the guild&rsquo;s been making.
          </h1>
        </div>

        <WelcomeBanner craftLabel={welcome} />

        <FeedList posts={feedPosts} isLoggedIn={Boolean(viewerId)} />
      </div>
    </main>
  );
}