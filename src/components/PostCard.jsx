"use client";

import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { formatRelativeTime } from "@/lib/formatTime";

// One post in the feed: image, caption, like button, and an
// expandable comment section. Like/comment both need the viewer to be
// logged in — if not, clicking either just nudges them to sign in.
export default function PostCard({ post, isLoggedIn }) {
  const [liked, setLiked] = useState(post.likedByViewer);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(null); // null = not loaded yet
  const [commentsError, setCommentsError] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [posting, setPosting] = useState(false);

  async function toggleLike() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    if (likeLoading) return;

    // Optimistic update — flip immediately, undo if the request fails.
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

  async function openComments() {
    setShowComments((v) => !v);
    if (comments === null) {
      try {
        const res = await fetch(`/server/posts/${post.id}/comments`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setComments(data.comments || []);
      } catch {
        setComments([]);
        setCommentsError(true);
      }
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    const text = commentText.trim();
    if (!text || posting) return;

    setPosting(true);
    try {
      const res = await fetch(`/server/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...(prev || []), data.comment]);
        setCommentCount((c) => c + 1);
        setCommentText("");
      }
    } finally {
      setPosting(false);
    }
  }

  return (
    <article className="rounded-2xl border border-thread/10 bg-ink-soft overflow-hidden transition-transform hover:-translate-y-0.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.imageUrl} alt={post.caption || "Post"} className="w-full aspect-[4/5] object-cover" />

      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-gold/20 text-gold-light font-display text-xs font-semibold">
            {post.authorName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-canvas truncate">{post.authorName}</p>
          </div>
          <span className="ml-auto text-xs text-thread/40 shrink-0">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
        {post.caption && (
          <p className="mt-2.5 text-sm text-thread/70 leading-relaxed">{post.caption}</p>
        )}

        <div className="flex items-center gap-5 mt-3">
          <button
            type="button"
            onClick={toggleLike}
            className="flex items-center gap-1.5 text-sm text-thread/70 hover:text-clay-light transition-colors"
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} className={liked ? "text-clay-light" : ""} />
            {likeCount}
          </button>

          <button
            type="button"
            onClick={openComments}
            className="flex items-center gap-1.5 text-sm text-thread/70 hover:text-canvas transition-colors"
          >
            <MessageCircle size={18} />
            {commentCount}
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-thread/10 pt-4">
            {comments === null ? (
              <p className="text-xs text-thread/40">Loading comments…</p>
            ) : commentsError ? (
              <p className="text-xs text-clay-light">Couldn&rsquo;t load comments. Try again.</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-thread/40">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium text-canvas">{c.authorName}</span>{" "}
                  <span className="text-thread/70">{c.text}</span>
                </div>
              ))
            )}

            <form onSubmit={submitComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={isLoggedIn ? "Add a comment…" : "Log in to comment"}
                disabled={!isLoggedIn}
                className="flex-1 rounded-full border border-thread/15 bg-ink px-3.5 py-2 text-sm text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isLoggedIn || posting}
                className="text-sm font-medium text-gold-light hover:text-gold disabled:opacity-50 transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}