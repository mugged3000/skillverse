import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import PostViewer from "@/components/PostViewer";
// export const dynamic = "force-dynamic";

export default async function ProfessionalPostPage({ params }) {
  const { userId: profileUserId, postId } = await params;
  const viewerId = await getSessionUserId();

  // Same "all of this professional's posts" set the grid on their
  // profile shows, in the same order — so scrolling here lines up
  // with what the visitor saw when they clicked in from the grid.
  const posts = await prisma.post.findMany({
    where: { authorId: profileUserId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { likes: true, comments: true } },
      likes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
    },
  });

  const viewerPosts = posts.map((post) => ({
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
    likedByViewer: viewerId ? post.likes.length > 0 : false,
  }));

  const targetExists = viewerPosts.some((p) => p.id === postId);

  if (viewerPosts.length === 0 || !targetExists) {
    return (
      <main className="min-h-dvh bg-ink px-6 py-16 text-center">
        <p className="text-thread/60">This post isn&rsquo;t available anymore.</p>
      </main>
    );
  }

  return (
    <PostViewer
      posts={viewerPosts}
      initialPostId={postId}
      isLoggedIn={Boolean(viewerId)}
      profileUserId={profileUserId}
    />
  );
}