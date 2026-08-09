"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PostCard from "@/components/PostCard";

// Client wrapper around the (real, server-fetched) posts array — all
// this adds is the entrance animation and the empty state. Data
// fetching itself stays server-side in feed/page.jsx.
export default function FeedList({ posts, isLoggedIn }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (!posts.length) return;
      gsap.from(".feed-post", {
        y: 24,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.1,
      });
    },
    { scope: root, dependencies: [posts.length] }
  );

  if (posts.length === 0) {
    return (
      <div
        ref={root}
        className="rounded-2xl border border-dashed border-thread/15 px-6 py-16 text-center"
      >
        <p className="font-display text-lg text-canvas">No posts yet</p>
        <p className="mt-2 text-sm text-thread/50">
          Once pros start sharing their work, it&rsquo;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div ref={root} className="space-y-8">
      {posts.map((post) => (
        <div key={post.id} className="feed-post">
          <PostCard post={post} isLoggedIn={isLoggedIn} />
        </div>
      ))}
    </div>
  );
}