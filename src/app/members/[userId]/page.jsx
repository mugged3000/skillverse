import prisma from "@/db/dbkey";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, CalendarDays } from "lucide-react";
import { getSessionUserId } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";
import FeedHeader from "@/components/feed/FeedHeader";
import MemberEditForm from "@/components/MemberEditForm";
import PostMedia from "@/components/PostMedia";
import ContactButton from "@/components/ContactButton";
import { CRAFTS } from "@/lib/crafts";
import { formatRelativeTime } from "@/lib/formatTime";

// Profile page for regular (non-professional) members. Professionals are
// sent to their own richer page, so linking to /members/:id from
// anywhere (e.g. a comment) always lands on the right profile.

function formatCraftLabel(key) {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function personHref(person) {
  return person.professionalProfile ? `/professionals/${person.id}` : `/members/${person.id}`;
}

function Avatar({ name, url, size = "w-10 h-10 text-sm" }) {
  return (
    <span
      className={`grid place-items-center shrink-0 rounded-full bg-gold/20 text-gold-light font-display font-semibold overflow-hidden ${size}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function PersonRow({ person }) {
  return (
    <Link
      href={personHref(person)}
      className="flex items-center gap-3 rounded-xl border border-thread/10 bg-ink-soft px-4 py-3 hover:border-thread/25 transition-colors"
    >
      <Avatar name={person.name} url={person.avatarUrl} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-canvas truncate">{person.name}</p>
        <p className="text-xs text-thread/50">
          {person.professionalProfile ? formatCraftLabel(person.professionalProfile.craftKey) : "Member"}
        </p>
      </div>
    </Link>
  );
}

const PERSON_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  professionalProfile: { select: { craftKey: true } },
};

export default async function MemberProfilePage({ params, searchParams }) {
  const { userId: profileUserId } = await params;
  const { tab: tabParam } = await searchParams;
  const viewerId = await getSessionUserId();

  const user = await prisma.user.findUnique({
    where: { id: profileUserId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      location: true,
      interests: true,
      interestGoals: true,
      contactLink: true,
      createdAt: true,
      professionalProfile: { select: { id: true } },
    },
  });

  if (!user) {
    return (
      <main className="min-h-dvh bg-ink px-6 py-16 text-center">
        <p className="text-thread/60">This profile doesn&rsquo;t exist.</p>
      </main>
    );
  }

  // Professionals have their own page.
  if (user.professionalProfile) redirect(`/professionals/${user.id}`);

  const isOwnProfile = viewerId === user.id;
  const viewerProfile = viewerId
    ? await prisma.professionalProfile.findUnique({ where: { userId: viewerId } })
    : null;

  // Liked posts are only visible to the member themselves.
  const allowedTabs = isOwnProfile
    ? ["activity", "followers", "following", "likes"]
    : ["activity", "followers", "following"];
  const tab = allowedTabs.includes(tabParam) ? tabParam : "activity";

  const [followerCount, followingCount, commentCount, existingFollow] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.comment.count({ where: { authorId: user.id } }),
    viewerId && !isOwnProfile
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
        })
      : null,
  ]);

  let comments = [];
  let people = [];
  let likedPosts = [];

  if (tab === "activity") {
    comments = await prisma.comment.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        post: { select: { id: true, authorId: true, caption: true, author: { select: { name: true } } } },
      },
    });
  } else if (tab === "followers") {
    const rows = await prisma.follow.findMany({
      where: { followingId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { follower: { select: PERSON_SELECT } },
    });
    people = rows.map((r) => r.follower);
  } else if (tab === "following") {
    const rows = await prisma.follow.findMany({
      where: { followerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { following: { select: PERSON_SELECT } },
    });
    people = rows.map((r) => r.following);
  } else if (tab === "likes") {
    const rows = await prisma.like.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        post: { select: { id: true, authorId: true, imageUrl: true, mediaType: true, caption: true } },
      },
    });
    likedPosts = rows.map((r) => r.post);
  }

  const goals =
    user.interestGoals && typeof user.interestGoals === "object" ? user.interestGoals : {};
  const goalEntries = user.interests
    .filter((key) => typeof goals[key] === "string" && goals[key])
    .map((key) => ({ key, text: goals[key], craft: CRAFTS.find((c) => c.key === key) }))
    .filter((g) => g.craft);

  const joinedYear = user.createdAt.getFullYear();
  const joinedFull = user.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const base = `/members/${user.id}`;
  const tabs = [
    { key: "activity", label: "Activity" },
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
    ...(isOwnProfile ? [{ key: "likes", label: "Liked" }] : []),
  ];

  const stats = [
    { key: "followers", label: "Followers", value: followerCount },
    { key: "following", label: "Following", value: followingCount },
    { key: "activity", label: "Comments", value: commentCount },
  ];

  return (
    <main className="min-h-dvh bg-ink">
      <FeedHeader
        showBackToFeed
        isProfessional={Boolean(viewerProfile)}
        viewerId={viewerId || undefined}
      />

      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <Avatar name={user.name} url={user.avatarUrl} size="w-20 h-20 text-2xl" />

            <div className="min-w-0">
              <h1 className="font-display font-semibold text-2xl text-canvas">{user.name}</h1>
              <p className="text-sm text-gold-light mt-1">Member since {joinedYear}</p>

              {user.bio && (
                <p className="text-sm text-thread/70 mt-3 max-w-sm whitespace-pre-line break-words">
                  {user.bio}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-thread/50">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} strokeWidth={2} />
                    {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} strokeWidth={2} />
                  Joined {joinedFull}
                </span>
              </div>

              <ContactButton url={user.contactLink} />
            </div>
          </div>

          {isOwnProfile ? (
            <span className="shrink-0 rounded-full border border-thread/15 px-4 py-2 text-xs font-semibold text-thread/50">
              Your profile
            </span>
          ) : viewerId ? (
            <FollowButton targetUserId={user.id} initiallyFollowing={Boolean(existingFollow)} />
          ) : (
            <Link
              href="/login"
              className="shrink-0 rounded-full bg-gold text-ink px-5 py-2 text-sm font-semibold hover:bg-gold-light transition-colors"
            >
              Log in to follow
            </Link>
          )}
        </div>

        {user.interests.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {user.interests.map((key) => {
              const craft = CRAFTS.find((c) => c.key === key);
              if (!craft) return null;
              return (
                <span
                  key={key}
                  className="rounded-full border border-thread/15 px-3 py-1 text-xs text-thread/70"
                >
                  {craft.name}
                </span>
              );
            })}
          </div>
        )}

        {goalEntries.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {goalEntries.map((g) => (
              <blockquote
                key={g.key}
                className="rounded-xl border-l-2 border-gold bg-gold/5 px-4 py-3"
              >
                <p className="text-sm italic text-thread/85 break-words">&ldquo;{g.text}&rdquo;</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-gold-light">
                  {g.craft.name}
                </p>
              </blockquote>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 rounded-2xl border border-thread/10 bg-ink-soft divide-x divide-thread/10">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={`${base}?tab=${s.key}`}
              className="py-3.5 text-center hover:bg-thread/5 transition-colors first:rounded-l-2xl last:rounded-r-2xl"
            >
              <p className="font-display font-semibold text-lg text-canvas tabular-nums">{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-thread/45">{s.label}</p>
            </Link>
          ))}
        </div>

        {isOwnProfile && (
          <div>
            <MemberEditForm
              initialAvatarUrl={user.avatarUrl}
              initialBio={user.bio}
              initialLocation={user.location}
              initialInterests={user.interests}
              initialGoals={goals}
              initialContactLink={user.contactLink}
            />
            <Link
              href="/become-professional"
              className="block mt-4 text-sm font-semibold text-thread/60 hover:text-canvas transition-colors"
            >
              Want to offer your skills? Become a professional
            </Link>
          </div>
        )}

        <nav className="mt-8 flex gap-6 border-b border-thread/10">
          {tabs.map((t) => (
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

        <div className="mt-5">
          {tab === "activity" &&
            (comments.length === 0 ? (
              <p className="text-sm text-thread/50">No comments yet.</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/professionals/${c.post.authorId}/posts/${c.post.id}`}
                      className="block rounded-xl border border-thread/10 bg-ink-soft px-4 py-3 hover:border-thread/25 transition-colors"
                    >
                      <p className="text-sm text-thread/85 break-words">{c.text}</p>
                      <p className="mt-1.5 text-xs text-thread/40">
                        on {c.post.author.name}&rsquo;s post · {formatRelativeTime(c.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

          {(tab === "followers" || tab === "following") &&
            (people.length === 0 ? (
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
            ))}

          {tab === "likes" &&
            (likedPosts.length === 0 ? (
              <p className="text-sm text-thread/50">You haven&rsquo;t liked any posts yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {likedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/professionals/${post.authorId}/posts/${post.id}`}
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
                ))}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}