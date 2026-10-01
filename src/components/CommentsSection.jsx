"use client";

/*
  All comment behavior lives here — fetching, posting, replying,
  per-comment likes, and delete — so PostCard's inline panel and the
  full-screen post viewer share one implementation instead of two
  copies drifting apart.

  Props:
    postId       — which post's comments to load
    isLoggedIn   — gates posting/liking/replying (redirects to /login)
    onCountChange(delta) — called with +1/-1/-N whenever the total
                   comment count (including replies) changes, so the
                   parent's own counter stays in sync
    maxHeightClass — Tailwind max-height class for the scrollable list
                   (callers size this differently: compact inline
                   panel vs. a taller bottom sheet)
*/

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Heart, Trash2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { formatRelativeTime } from "@/lib/formatTime";
import { mapCommentTree, removeFromCommentTree } from "@/lib/commentTree";

export default function CommentsSection({
  postId,
  isLoggedIn,
  onCountChange,
  maxHeightClass = "max-h-96",
}) {
  const commentListRef = useRef(null);
  const hasAnimatedInitialLoad = useRef(false);

  const [comments, setComments] = useState(null); // null = loading
  const [commentsError, setCommentsError] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/server/posts/${postId}/comments`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) setComments(data.comments || []);
      } catch {
        if (!cancelled) {
          setComments([]);
          setCommentsError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // Fade the list in ONCE, the first time it finishes loading. This
  // used to re-run on every comment mutation (including a single
  // like), which reset every comment's opacity to 0 and faded the
  // whole list back in — looking like a "blur" and masking the
  // like button's own feedback. Now it only fires for the initial
  // load.
  useGSAP(
    () => {
      if (!comments || comments.length === 0 || !commentListRef.current) return;
      if (hasAnimatedInitialLoad.current) return;
      hasAnimatedInitialLoad.current = true;
      gsap.from(commentListRef.current.querySelectorAll(".comment-item"), {
        autoAlpha: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.out",
      });
    },
    { dependencies: [comments] }
  );

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
      const res = await fetch(`/server/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...(prev || []), data.comment]);
        onCountChange?.(1);
        setCommentText("");
      }
    } finally {
      setPosting(false);
    }
  }

  async function submitReply(e, parentComment) {
    e.preventDefault();
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    const text = replyText.trim();
    if (!text || postingReply) return;

    setPostingReply(true);
    try {
      const res = await fetch(`/server/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, parentId: parentComment.id }),
      });
      const data = await res.json();
      if (res.ok) {
        // A reply-to-a-reply gets flattened onto its parent server-
        // side, so attach it wherever the server actually put it.
        const targetId = data.comment.parentId || parentComment.id;
        setComments((prev) =>
          mapCommentTree(prev || [], targetId, (c) => ({
            ...c,
            replies: [...(c.replies || []), data.comment],
          }))
        );
        onCountChange?.(1);
        setReplyText("");
        setReplyingTo(null);
      }
    } finally {
      setPostingReply(false);
    }
  }

  async function toggleCommentLike(comment) {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    const nextLiked = !comment.likedByViewer;
    setComments((prev) =>
      mapCommentTree(prev || [], comment.id, (c) => ({
        ...c,
        likedByViewer: nextLiked,
        likeCount: c.likeCount + (nextLiked ? 1 : -1),
      }))
    );

    try {
      const res = await fetch(`/server/posts/${postId}/comments/${comment.id}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setComments((prev) =>
        mapCommentTree(prev || [], comment.id, (c) => ({
          ...c,
          likedByViewer: !nextLiked,
          likeCount: c.likeCount + (nextLiked ? -1 : 1),
        }))
      );
    }
  }

  async function deleteComment(comment) {
    if (!window.confirm("Delete this comment?")) return;

    const removedCount = 1 + (comment.replies?.length || 0);
    const prevComments = comments;
    setComments((prev) => removeFromCommentTree(prev || [], comment.id));
    onCountChange?.(-removedCount);

    try {
      const res = await fetch(`/server/posts/${postId}/comments/${comment.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setComments(prevComments);
      onCountChange?.(removedCount);
    }
  }

  return (
    <div className="flex flex-col min-h-0">
      <div ref={commentListRef} className={`${maxHeightClass} overflow-y-auto px-4 py-3.5 space-y-3.5`}>
        {comments === null ? (
          <div className="space-y-2.5 animate-pulse">
            <div className="h-3 w-3/4 rounded bg-thread/10" />
            <div className="h-3 w-1/2 rounded bg-thread/10" />
          </div>
        ) : commentsError ? (
          <p className="text-xs text-clay-light">Couldn&rsquo;t load comments. Try again.</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-thread/40">No comments yet — be the first to say something.</p>
        ) : (
          comments.map((c) => (
            <CommentThread
              key={c.id}
              comment={c}
              isLoggedIn={isLoggedIn}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              postingReply={postingReply}
              onSubmitReply={submitReply}
              onToggleLike={toggleCommentLike}
              onDelete={deleteComment}
            />
          ))
        )}
      </div>

      <form
        onSubmit={submitComment}
        className="flex items-center gap-2 px-4 py-3 border-t border-thread/10 bg-ink/40"
      >
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={isLoggedIn ? "Add a comment…" : "Log in to comment"}
          disabled={!isLoggedIn}
          className="flex-1 rounded-full border border-thread/15 bg-ink px-4 py-2.5 text-sm text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isLoggedIn || posting || !commentText.trim()}
          aria-label="Post comment"
          className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-gold text-ink hover:bg-gold-light disabled:opacity-40 disabled:hover:bg-gold transition-colors"
        >
          <Send size={16} strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}

function CommentThread({
  comment,
  isLoggedIn,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  postingReply,
  onSubmitReply,
  onToggleLike,
  onDelete,
}) {
  return (
    <div className="comment-item">
      <CommentRow
        comment={comment}
        isLoggedIn={isLoggedIn}
        isReplying={replyingTo === comment.id}
        onToggleReply={() => setReplyingTo((cur) => (cur === comment.id ? null : comment.id))}
        onToggleLike={onToggleLike}
        onDelete={onDelete}
      />

      {replyingTo === comment.id && (
        <ReplyForm
          replyText={replyText}
          setReplyText={setReplyText}
          posting={postingReply}
          onSubmit={(e) => onSubmitReply(e, comment)}
        />
      )}

      {comment.replies?.length > 0 && (
        <div className="mt-2.5 ml-9 pl-3.5 border-l border-thread/10 space-y-2.5">
          {comment.replies.map((r) => (
            <div key={r.id}>
              <CommentRow
                comment={r}
                isLoggedIn={isLoggedIn}
                isReplying={replyingTo === r.id}
                onToggleReply={() => setReplyingTo((cur) => (cur === r.id ? null : r.id))}
                onToggleLike={onToggleLike}
                onDelete={onDelete}
              />
              {replyingTo === r.id && (
                <ReplyForm
                  replyText={replyText}
                  setReplyText={setReplyText}
                  posting={postingReply}
                  onSubmit={(e) => onSubmitReply(e, r)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// A single comment or reply row: avatar + bubble on the left, a
// TikTok-style heart stacked above its like count on the right.
function CommentRow({ comment: c, isLoggedIn, isReplying, onToggleReply, onToggleLike, onDelete }) {
  const heartRef = useRef(null);

  function handleLike() {
    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 1 },
        { scale: 1.3, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 }
      );
    }
    onToggleLike(c);
  }

  return (
    <div className="flex items-start gap-2.5">
      <Link
        href={`/members/${c.authorId}`}
        aria-label={`View ${c.authorName}'s profile`}
        className="grid place-items-center w-7 h-7 shrink-0 rounded-full bg-thread/10 text-thread/70 font-display text-[11px] font-semibold overflow-hidden"
      >
        {c.authorAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.authorAvatarUrl} alt={c.authorName} className="w-full h-full object-cover" />
        ) : (
          c.authorName.charAt(0).toUpperCase()
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-sm bg-ink px-3.5 py-2 border border-thread/10">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/members/${c.authorId}`}
              className="text-xs font-medium text-canvas hover:text-gold-light transition-colors"
            >
              {c.authorName}
            </Link>
            {c.isPostAuthor && (
              <span className="rounded-full bg-gold/15 border border-gold/30 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-gold-light">
                Author
              </span>
            )}
          </div>
          <p className="text-sm text-thread/80 leading-snug break-words">{c.text}</p>
        </div>

        <div className="flex items-center gap-3.5 mt-1 pl-1 text-[11px] text-thread/40">
          <span>{formatRelativeTime(c.createdAt)}</span>
          <button
            type="button"
            onClick={onToggleReply}
            className={`font-medium hover:text-canvas transition-colors ${
              isReplying ? "text-gold-light" : ""
            }`}
          >
            Reply
          </button>
          {c.isOwn && (
            <button
              type="button"
              onClick={() => onDelete(c)}
              className="flex items-center gap-1 font-medium hover:text-clay-light transition-colors"
            >
              <Trash2 size={11} strokeWidth={2.2} />
              Delete
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLike}
        aria-pressed={c.likedByViewer}
        aria-label={c.likedByViewer ? "Unlike comment" : "Like comment"}
        className={
          "flex flex-col items-center gap-0.5 shrink-0 pt-1 px-1 transition-colors " +
          (c.likedByViewer ? "text-red-500" : "text-thread/40 hover:text-red-400")
        }
      >
        <Heart
          ref={heartRef}
          size={14}
          strokeWidth={2.4}
          fill={c.likedByViewer ? "currentColor" : "none"}
        />
        {c.likeCount > 0 && <span className="text-[10px] tabular-nums leading-none">{c.likeCount}</span>}
      </button>
    </div>
  );
}

function ReplyForm({ replyText, setReplyText, posting, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 mt-2 ml-9 pl-3.5">
      <input
        type="text"
        autoFocus
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a reply…"
        className="flex-1 rounded-full border border-thread/15 bg-ink px-3.5 py-2 text-xs text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
      />
      <button
        type="submit"
        disabled={posting || !replyText.trim()}
        aria-label="Post reply"
        className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-gold text-ink hover:bg-gold-light disabled:opacity-40 disabled:hover:bg-gold transition-colors"
      >
        <Send size={13} strokeWidth={2.4} />
      </button>
    </form>
  );
}