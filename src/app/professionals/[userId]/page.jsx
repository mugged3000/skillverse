import prisma from "@/db/dbkey";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";
import WelcomeBanner from "@/components/feed/WelcomeBanner";
import EditProfileForm from "@/components/EditProfileForm";
import CreatePostForm from "@/components/CreatePostForm";
import FeedHeader from "@/components/feed/FeedHeader";
import PostMedia from "@/components/PostMedia";
import PersonRow from "@/components/PersonRow";
import ContactButton from "@/components/ContactButton";
// export const dynamic = "force-dynamic";
// Turns "nail-tech" into "Nail Tech" for display.
function formatCraftLabel(key) {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ProfessionalProfilePage({ params, searchParams }) {
  const { userId: profileUserId } = await params;
  const { welcome, tab: tabParam } = await searchParams;
  const viewerId = await getSessionUserId();

  const profile = await prisma.professionalProfile.findUnique({
    where: { userId: profileUserId },
    include: { user: { select: { id: true, name: true, avatarUrl: true, contactLink: true } } },
  });

  if (!profile) {
    const isOwnEmptyProfile = viewerId === profileUserId;

    return (
      <main className="min-h-dvh bg-ink px-6 py-16 text-center">
        {isOwnEmptyProfile ? (
          <>
            <p className="text-thread/60">
              You haven&rsquo;t set up a professional profile yet — finish that first to post.
            </p>
            <Link
              href="/become-professional"
              className="inline-block mt-5 rounded-full bg-gold text-ink font-semibold px-6 py-3 hover:bg-gold-light transition-colors"
            >
              Become a professional
            </Link>
          </>
        ) : (
          <p className="text-thread/60">This professional profile doesn&rsquo;t exist.</p>
        )}
      </main>
    );
  }

  const tab = ["posts", "followers", "following"].includes(tabParam) ? tabParam : "posts";

  const [posts, followerCount, followingCount, existingFollow] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: profileUserId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.count({ where: { followingId: profileUserId } }),
    prisma.follow.count({ where: { followerId: profileUserId } }),
    viewerId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: viewerId, followingId: profileUserId },
          },
        })
      : null,
  ]);

  const isOwnProfile = viewerId === profileUserId;

  const personSelect = {
    id: true,
    name: true,
    avatarUrl: true,
    professionalProfile: { select: { craftKey: true } },
  };
  let people = [];
  if (tab === "followers") {
    const rows = await prisma.follow.findMany({
      where: { followingId: profileUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { follower: { select: personSelect } },
    });
    people = rows.map((r) => r.follower);
  } else if (tab === "following") {
    const rows = await prisma.follow.findMany({
      where: { followerId: profileUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { following: { select: personSelect } },
    });
    people = rows.map((r) => r.following);
  }

  const base = `/professionals/${profileUserId}`;
  const stats = [
    { key: "posts", label: "Posts", value: posts.length },
    { key: "followers", label: "Followers", value: followerCount },
    { key: "following", label: "Following", value: followingCount },
  ];

  return (
    <main className="min-h-dvh bg-ink">
      <FeedHeader showBackToFeed />

      <div className="mx-auto max-w-xl px-6 py-10">
        <WelcomeBanner craftLabel={welcome} />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid place-items-center w-16 h-16 shrink-0 rounded-full bg-gold/20 text-gold-light font-display text-xl font-semibold overflow-hidden">
              {profile.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.avatarUrl}
                  alt={profile.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.user.name.charAt(0).toUpperCase()
              )}
            </span>

            <div>
              <h1 className="font-display font-semibold text-2xl text-canvas">
                {profile.user.name}
              </h1>
              <p className="text-sm text-gold-light mt-1">
                {formatCraftLabel(profile.craftKey)}
              </p>
              <p className="text-sm text-thread/60 mt-3 max-w-sm">{profile.bio}</p>
              <p className="text-sm text-thread/50 mt-1">{profile.location}</p>

              <ContactButton url={profile.user.contactLink} />
            </div>
          </div>

          {isOwnProfile ? (
            <span className="shrink-0 rounded-full border border-thread/15 px-4 py-2 text-xs font-semibold text-thread/50">
              Your profile
            </span>
          ) : viewerId ? (
            <FollowButton
              targetUserId={profileUserId}
              initiallyFollowing={Boolean(existingFollow)}
            />
          ) : (
            <Link
              href="/login"
              className="shrink-0 rounded-full bg-gold text-ink px-5 py-2 text-sm font-semibold hover:bg-gold-light transition-colors"
            >
              Log in to follow
            </Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 rounded-2xl border border-thread/10 bg-ink-soft divide-x divide-thread/10">
          {stats.map((s) => (
            <Link
              key={s.key}
              href={`${base}?tab=${s.key}`}
              className="py-3.5 text-center hover:bg-thread/5 transition-colors first:rounded-l-2xl last:rounded-r-2xl"
            >
              <p className="font-display font-semibold text-lg text-canvas tabular-nums">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-thread/45">{s.label}</p>
            </Link>
          ))}
        </div>

        {isOwnProfile && (
          <EditProfileForm
            initialAvatarUrl={profile.user.avatarUrl}
            initialBio={profile.bio}
            initialLocation={profile.location}
            initialContactLink={profile.user.contactLink}
          />
        )}

        {isOwnProfile && <CreatePostForm />}

        <nav className="mt-10 flex gap-6 border-b border-thread/10">
          {[
            { key: "posts", label: "Posts" },
            { key: "followers", label: "Followers" },
            { key: "following", label: "Following" },
          ].map((t) => (
            <Link
              key={t.key}
              href={`${base}?tab=${t.key}`}
              className={
                "pb-3 text-sm font-medium border-b-2 -mb-px transition-colors " +
                (tab === t.key
                  ? "border-gold text-canvas"
                  : "border-transparent text-thread/50 hover:text-canvas")
              }
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {tab !== "posts" && (
          <div className="mt-5">
            {people.length === 0 ? (
              <p className="text-sm text-thread/50">
                {tab === "followers" ? "No followers yet." : "Not following anyone yet."}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {people.map((p) => (
                  <li key={p.id}>
                    <PersonRow person={p} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className={"mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3" + (tab === "posts" ? "" : " hidden")}>
          {posts.length === 0 ? (
            <p className="col-span-full text-sm text-thread/50">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/professionals/${profileUserId}/posts/${post.id}`}
                className="aspect-square rounded-xl overflow-hidden bg-ink-soft block"
              >
                <PostMedia
                  src={post.imageUrl}
                  mediaType={post.mediaType}
                  alt={post.caption || ""}
                  thumbnail
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}