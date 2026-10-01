"use client";

/*
  Full-screen, TikTok-style viewer for a professional's posts.
  Vertical scroll-snap: one post fills the screen at a time, and the
  visitor can scroll up or down to move to the next/previous post by
  that same professional. Opens already scrolled to the post that was
  clicked. Works the same for a random visitor, the professional
  themselves, and other professionals — nobody's locked out of
  scrolling or viewing engagement, only posting/liking/commenting
  needs a session (handled by isLoggedIn, same as everywhere else).
*/

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, X } from "lucide-react";
import gsap from "gsap";
import { formatRelativeTime } from "@/lib/formatTime";
import CommentsSection from "./CommentsSection";
import PostMedia from "./PostMedia";

export default function PostViewer({ posts, initialPostId, isLoggedIn, profileUserId }) {
  const containerRef = useRef(null);
  const [commentSheetPostId, setCommentSheetPostId] = useState(null);
  const [activePostId, setActivePostId] = useState(initialPostId);

  // Land on the post that was actually clicked, not the top of the
  // list — instantly, not animated. This container has no scroll-smooth
  // class specifically so this jump can't animate through every post
  // in between (which used to trigger several videos loading/playing
  // at once mid-scroll — the "hanging" mobile users saw).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const idx = Math.max(
      0,
      posts.findIndex((p) => p.id === initialPostId)
    );
    container.scrollTop = idx * container.clientHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tracks which slide is actually on screen right now, so only that
  // post's video plays — every other video stays paused. Without this,
  // every video in the list would sit there trying to load/play at
  // once, which is exactly what made scrolling feel like it was
  // hanging on mobile.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) setActivePostId(mostVisible.target.dataset.postId);
      },
      { root: container, threshold: 0.6 }
    );

    const slides = container.querySelectorAll("[data-post-id]");
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [posts]);

  return (
    // On mobile/tablet this fills the screen, same as a TikTok feed.
    // From the lg breakpoint up, it becomes a dimmed backdrop with a
    // centered 60%-wide panel — a click-through post shouldn't take
    // over an entire desktop monitor.
    //
    // No entrance animation on this panel on purpose — it used to
    // fade/scale in with GSAP, but on a slow mobile connection (still
    // loading the post's image/video) that animation could get cut
    // short partway, leaving the whole panel stuck faintly transparent
    // and very slightly shrunk — visually looked like everything had
    // gone blurry, and only a hard refresh (a fresh mount) cleared it,
    // since that leftover style lives outside anything React re-renders
    // would reset. A full-page view like this doesn't need a pop-in
    // effect anyway.
    <div className="fixed inset-0 z-50 bg-black lg:bg-black/90 lg:flex lg:items-center lg:justify-center lg:p-6">
      <div className="relative h-dvh w-full overflow-hidden bg-black lg:h-[90vh] lg:w-[60%] lg:max-w-2xl lg:rounded-3xl lg:shadow-2xl lg:ring-1 lg:ring-white/10">
        <Link
          href={`/professionals/${profileUserId}`}
          className="absolute z-20 grid place-items-center w-10 h-10 rounded-full bg-black/40 text-canvas backdrop-blur-sm hover:bg-black/60 transition-colors"
          style={{ top: "max(1rem, env(safe-area-inset-top))", left: "1rem" }}
          aria-label="Back to profile"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </Link>

        <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory">
          {posts.map((post) => (
            <ViewerSlide
              key={post.id}
              post={post}
              isLoggedIn={isLoggedIn}
              isActive={post.id === activePostId}
              onOpenComments={() => setCommentSheetPostId(post.id)}
            />
          ))}
        </div>

        {commentSheetPostId && (
          <CommentSheet
            postId={commentSheetPostId}
            isLoggedIn={isLoggedIn}
            onClose={() => setCommentSheetPostId(null)}
          />
        )}
      </div>
    </div>
  );
}

function ViewerSlide({ post, isLoggedIn, isActive, onOpenComments }) {
  const heartRef = useRef(null);

  const [liked, setLiked] = useState(post.likedByViewer);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [likeLoading, setLikeLoading] = useState(false);

  async function toggleLike() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    if (likeLoading) return;

    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 1 },
        { scale: 1.35, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }
      );
    }

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
    <section data-post-id={post.id} className="relative h-full w-full snap-start snap-always">
      <PostMedia
        src={post.imageUrl}
        mediaType={post.mediaType}
        alt={post.caption || "Post"}
        className="absolute inset-0 w-full h-full object-cover"
        active={isActive}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
      />

      {/* Author bar */}
      <div
        className="absolute left-4 right-20 flex items-center gap-2.5"
        style={{ top: "max(4rem, calc(env(safe-area-inset-top) + 3.5rem))" }}
      >
        <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-gold/20 text-gold-light font-display text-xs font-semibold overflow-hidden ring-2 ring-white/20">
          {post.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.authorAvatarUrl} alt={post.authorName} className="w-full h-full object-cover" />
          ) : (
            post.authorName.charAt(0).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{post.authorName}</p>
          <p className="text-xs text-white/60">{formatRelativeTime(post.createdAt)}</p>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <p
          className="absolute left-4 right-20 text-sm text-white/90 leading-relaxed line-clamp-4"
          style={{ bottom: "max(6rem, calc(env(safe-area-inset-bottom) + 5.5rem))" }}
        >
          {post.caption}
        </p>
      )}

      {/* Engagement rail — TikTok-style, stacked on the right */}
      <div
        className="absolute right-3 flex flex-col items-center gap-5"
        style={{ bottom: "max(6rem, calc(env(safe-area-inset-bottom) + 5.5rem))" }}
      >
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="grid place-items-center w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm">
            <Heart
              ref={heartRef}
              size={24}
              strokeWidth={2.2}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-clay-light" : "text-white"}
            />
          </span>
          <span className="text-xs font-medium tabular-nums drop-shadow">{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={onOpenComments}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="grid place-items-center w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm">
            <MessageCircle size={24} strokeWidth={2.2} className="text-white" />
          </span>
          <span className="text-xs font-medium tabular-nums drop-shadow">{commentCount}</span>
        </button>
      </div>
    </section>
  );
}

// Bottom sheet with the same CommentsSection used inline in the feed
// — replies, per-comment hearts, delete — just presented as a
// full-width drawer over the full-screen viewer.
//
// No slide-up animation here on purpose — it used to animate in with
// GSAP, but if that animation got interrupted (easy to do on a slower
// phone — tapping the comment button again, or the tap registering
// while the previous close animation was still running), the sheet
// could end up stuck partway off-screen, looking like it "wouldn't
// show" at all. Appearing instantly is less flashy but never breaks.
function CommentSheet({ postId, isLoggedIn, onClose }) {
  return (
    <div className="absolute inset-0 z-30 flex items-end">
      <button
        type="button"
        aria-label="Close comments"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        className="relative w-full max-h-[75%] rounded-t-2xl bg-ink-soft border-t border-thread/10 flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-thread/10">
          <p className="text-sm font-medium text-canvas">Comments</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center w-8 h-8 rounded-full text-thread/60 hover:text-canvas hover:bg-thread/10 transition-colors"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>
        <CommentsSection postId={postId} isLoggedIn={isLoggedIn} maxHeightClass="max-h-[50vh]" />
      </div>
    </div>
  );
}