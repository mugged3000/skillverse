"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import gsap from "gsap";
import { formatRelativeTime } from "@/lib/formatTime";
import CommentsSection from "./CommentsSection";
import PostMedia from "./PostMedia";

// One post in the feed: image, caption, like button, and an
// expandable comment section (replies, per-comment hearts, delete —
// all handled by CommentsSection). Like/comment both need the viewer
// to be logged in — if not, clicking either just nudges them to sign in.
export default function PostCard({ post, isLoggedIn }) {
  const heartRef = useRef(null);

  const [liked, setLiked] = useState(post.likedByViewer);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  function popHeart() {
    if (!heartRef.current) return;
    gsap.fromTo(
      heartRef.current,
      { scale: 1 },
      { scale: 1.35, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }
    );
  }

  async function toggleLike() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    if (likeLoading) return;

    popHeart();

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
    setLikeLoading(true);

    try {
      const res = await fetch(`/server/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
    } catch {
      setLiked(!nextLiked);
      setLikeCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setLikeLoading(false);
    }
  }

  return (
    <article className="rounded-2xl border border-thread/10 bg-ink-soft overflow-hidden transition-transform hover:-translate-y-0.5">
      <PostMedia
        src={post.imageUrl}
        mediaType={post.mediaType}
        alt={post.caption || "Post"}
        className="w-full aspect-[4/5] object-cover"
      />

      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <Link
            href={`/professionals/${post.authorId}`}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-gold/20 text-gold-light font-display text-xs font-semibold overflow-hidden">
              {post.authorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.authorAvatarUrl}
                  alt={post.authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                post.authorName.charAt(0).toUpperCase()
              )}
            </span>
            <p className="text-sm font-medium text-canvas truncate group-hover:text-gold-light transition-colors">
              {post.authorName}
            </p>
          </Link>
          <span className="ml-auto text-xs text-thread/40 shrink-0">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        {post.caption && (
          <p className="mt-2.5 text-sm text-thread/70 leading-relaxed">{post.caption}</p>
        )}

        {/* Like / comment bar — bold, thumb-friendly tap targets on mobile */}
        <div className="flex items-center gap-2 mt-3 -ml-2">
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-thread/70 hover:text-clay-light hover:bg-clay/10 active:bg-clay/15 transition-colors"
          >
            <Heart
              ref={heartRef}
              size={22}
              strokeWidth={2.4}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-clay-light" : ""}
            />
            <span className="tabular-nums">{likeCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            aria-expanded={showComments}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-thread/70 hover:text-canvas hover:bg-thread/5 active:bg-thread/10 transition-colors"
          >
            <MessageCircle size={22} strokeWidth={2.4} />
                      <span className="tabular-nums">{commentCount}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-3 -mx-4 border-t border-thread/10">
            <CommentsSection
              postId={post.id}
              isLoggedIn={isLoggedIn}
              onCountChange={(delta) => setCommentCount((c) => c + delta)}
              maxHeightClass="max-h-96"
            />
          </div>
        )}
      </div>
    </article>
  );
}