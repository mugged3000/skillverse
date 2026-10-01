// Small immutable helpers for a one-level-deep comment tree
// (top-level comments + their replies). Shared by every place that
// renders comments (PostCard's inline panel, the full-screen post
// viewer) so they all behave identically.

export function mapCommentTree(comments, id, updater) {
  return comments.map((c) => {
    if (c.id === id) return updater(c);
    if (c.replies?.length) {
      return { ...c, replies: mapCommentTree(c.replies, id, updater) };
    }
    return c;
  });
}

export function removeFromCommentTree(comments, id) {
  return comments
    .filter((c) => c.id !== id)
    .map((c) => (c.replies?.length ? { ...c, replies: removeFromCommentTree(c.replies, id) } : c));
}