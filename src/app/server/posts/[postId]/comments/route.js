import { NextResponse } from "next/server";
import prisma from "@/db/dbkey";
import { getSessionUserId } from "@/lib/auth";
import { notify, snippet, NOTIFY } from "@/lib/notify";

// Shapes a comment row (with its author, likes and replies already
// included) into the flat object the client expects.
function serializeComment(c, viewerId, postAuthorId) {
  return {
    id: c.id,
    text: c.text,
    authorId: c.authorId,
    authorName: c.author.name,
    authorAvatarUrl: c.author.avatarUrl,
    createdAt: c.createdAt,
    parentId: c.parentId,
    likeCount: c.likes.length,
    likedByViewer: viewerId ? c.likes.some((l) => l.userId === viewerId) : false,
    isOwn: viewerId === c.authorId,
    isPostAuthor: c.authorId === postAuthorId,
    replies: (c.replies || [])
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((r) => serializeComment(r, viewerId, postAuthorId)),
  };
}

export async function GET(req, { params }) {
  const { postId } = await params;
  const viewerId = await getSessionUserId();

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  const postAuthorId = post?.authorId ?? null;

  // Only fetch top-level comments, each with its replies (one level
  // deep, TikTok/IG-style) nested inside — replies never have their
  // own replies.
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      likes: { select: { userId: true } },
      replies: {
        include: {
          author: { select: { name: true, avatarUrl: true } },
          likes: { select: { userId: true } },
        },
      },
    },
  });

  return NextResponse.json({
    comments: comments.map((c) => serializeComment(c, viewerId, postAuthorId)),
  });
}

export async function POST(req, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
  }

  const { postId } = await params;
  const body = await req.json().catch(() => null);
  const text = body?.text?.trim();
  const parentId = typeof body?.parentId === "string" ? body.parentId : null;

  if (!text) {
    return NextResponse.json({ error: "Comment can't be empty." }, { status: 400 });
  }

  if (text.length > 500) {
    return NextResponse.json({ error: "Comment is too long." }, { status: 400 });
  }

  // A reply must target a real, top-level comment on this same post —
  // replying to a reply just flattens onto that reply's parent, so
  // threads stay one level deep.
  let resolvedParentId = null;
  let repliedToAuthorId = null;
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.postId !== postId) {
      return NextResponse.json({ error: "That comment no longer exists." }, { status: 400 });
    }
    resolvedParentId = parent.parentId || parent.id;
    repliedToAuthorId = parent.authorId;
  }

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) {
    return NextResponse.json({ error: "That post no longer exists." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { postId, authorId: userId, text, parentId: resolvedParentId },
    include: {
      author: { select: { name: true, avatarUrl: true } },
      likes: { select: { userId: true } },
    },
  });

  // Notify: the person replied to gets "replied to your comment"; the
  // post's owner gets "commented on your post" (unless they're the one
  // being replied to — they already got the reply notification).
  const preview = snippet(text);
  if (repliedToAuthorId) {
    await notify({
      recipientId: repliedToAuthorId,
      actorId: userId,
      type: NOTIFY.REPLY,
      postId,
      commentId: comment.id,
      preview,
    });
  }
  if (post.authorId !== repliedToAuthorId) {
    await notify({
      recipientId: post.authorId,
      actorId: userId,
      type: NOTIFY.COMMENT,
      postId,
      commentId: comment.id,
      preview,
    });
  }

  return NextResponse.json({
    comment: {
      id: comment.id,
      text: comment.text,
      authorId: comment.authorId,
      authorName: comment.author.name,
      authorAvatarUrl: comment.author.avatarUrl,
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      likeCount: 0,
      likedByViewer: false,
      isOwn: true,
      isPostAuthor: comment.authorId === post.authorId,
      replies: [],
    },
  });
}