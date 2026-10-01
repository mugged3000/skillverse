import prisma from "@/db/dbkey";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import FeedHeader from "@/components/feed/FeedHeader";
import FollowButton from "@/components/FollowButton";
import PostMedia from "@/components/PostMedia";
import MarkNotificationsRead from "@/components/MarkNotificationsRead";
import { formatRelativeTime } from "@/lib/formatTime";

const ACTION_TEXT = {
  FOLLOW: "started following you",
  POST_LIKE: "liked your post",
  COMMENT: "commented on your post",
  REPLY: "replied to your comment",
  COMMENT_LIKE: "liked your comment",
  BOOKING: "booked an appointment with you",
};

function actorHref(actor) {
  return actor.professionalProfile ? `/professionals/${actor.id}` : `/members/${actor.id}`;
}

export default async function NotificationsPage() {
  const viewerId = await getSessionUserId();
  if (!viewerId) redirect("/login?reason=session_expired");

  const [notifications, viewerProfile] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: viewerId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            professionalProfile: { select: { craftKey: true } },
          },
        },
        post: { select: { id: true, authorId: true, imageUrl: true, mediaType: true, caption: true } },
      },
    }),
    prisma.professionalProfile.findUnique({ where: { userId: viewerId } }),
  ]);

  // For "follow back": which of these people do I already follow?
  const followerIds = [...new Set(notifications.filter((n) => n.type === "FOLLOW").map((n) => n.actorId))];
  const alreadyFollowing = followerIds.length
    ? await prisma.follow.findMany({
        where: { followerId: viewerId, followingId: { in: followerIds } },
        select: { followingId: true },
      })
    : [];
  const followingSet = new Set(alreadyFollowing.map((f) => f.followingId));

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <main className="min-h-dvh bg-ink">
      <FeedHeader showBackToFeed isProfessional={Boolean(viewerProfile)} viewerId={viewerId} />
      <MarkNotificationsRead hasUnread={hasUnread} />

      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="font-display font-semibold text-2xl text-canvas">Notifications</h1>

        {notifications.length === 0 ? (
          <p className="mt-6 text-sm text-thread/50">
            Nothing yet. When someone follows you, likes or comments on your posts, you&rsquo;ll see it here.
          </p>
        ) : (
          <ul className="mt-6 space-y-2.5">
            {notifications.map((n) => {
              const href =
                n.type !== "FOLLOW" && n.post
                  ? `/professionals/${n.post.authorId}/posts/${n.post.id}`
                  : actorHref(n.actor);

              return (
                <li
                  key={n.id}
                  className={
                    "flex items-center gap-3 rounded-xl border px-4 py-3 " +
                    (n.read ? "border-thread/10 bg-ink-soft" : "border-gold/40 bg-gold/5")
                  }
                >
                  <Link href={actorHref(n.actor)} className="shrink-0" aria-label={`${n.actor.name}'s profile`}>
                    <span className="grid place-items-center w-10 h-10 rounded-full bg-gold/20 text-gold-light font-display text-sm font-semibold overflow-hidden">
                      {n.actor.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={n.actor.avatarUrl} alt={n.actor.name} className="w-full h-full object-cover" />
                      ) : (
                        n.actor.name.charAt(0).toUpperCase()
                      )}
                    </span>
                  </Link>

                  <Link href={href} className="min-w-0 flex-1">
                    <p className="text-sm text-thread/85 break-words">
                      <span className="font-semibold text-canvas">{n.actor.name}</span>{" "}
                      {ACTION_TEXT[n.type] || "interacted with you"}
                    </p>
                    {n.preview && (
                      <p className="mt-0.5 text-xs text-thread/55 break-words">&ldquo;{n.preview}&rdquo;</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-thread/40">{formatRelativeTime(n.createdAt)}</p>
                  </Link>

                  {n.type === "FOLLOW" ? (
                    <FollowButton
                      targetUserId={n.actorId}
                      initiallyFollowing={followingSet.has(n.actorId)}
                      followLabel="Follow back"
                    />
                  ) : n.post ? (
                    <Link
                      href={href}
                      className="shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-ink block"
                      aria-label="Open post"
                    >
                      <PostMedia
                        src={n.post.imageUrl}
                        mediaType={n.post.mediaType}
                        alt={n.post.caption || ""}
                        thumbnail
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}