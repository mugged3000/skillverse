"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";

// Cloudinary videos are rewritten to use f_auto,q_auto for broad
// codec compatibility at upload time (see cloudinaryUpload.js) — this
// does the same rewrite here too, at render time, so any video saved
// before that fix existed (raw iPhone .mov/HEVC, which won't play on
// most Android phones/browsers) gets fixed automatically as well,
// with no need to touch what's already stored in the database.
function withCompatibleFormat(url) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("f_auto")) return url; // already rewritten
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

// Renders a post's media as an <img> or <video> depending on
// mediaType — every place that shows a post's image (feed card, full
// viewer, profile grid thumbnail) goes through this instead of each
// deciding for itself.
//
//   thumbnail=false (default) — full post view: video gets native
//     controls so the visitor can actually play it with sound.
//   thumbnail=true — grid/preview context: video is muted, looped,
//     and shows a small play badge instead of controls, matching how
//     Instagram/TikTok-style grids preview video posts.
//   active=true (default) — set to false for an off-screen slide in a
//     scrolling list (like PostViewer) so its video doesn't sit there
//     loading/decoding in the background; it's paused and its preload
//     dropped to "none" until it's active again. Irrelevant for images.
export default function PostMedia({
  src,
  mediaType,
  alt = "",
  className = "",
  thumbnail = false,
  active = true,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!active && videoRef.current) {
      videoRef.current.pause();
    }
  }, [active]);

  if (mediaType !== "video") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={withCompatibleFormat(src)}
        className="absolute inset-0 w-full h-full object-cover"
        controls={!thumbnail}
        muted={thumbnail}
        loop={thumbnail}
        playsInline
        preload={active ? "metadata" : "none"}
      />
      {thumbnail && (
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="grid place-items-center w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white">
            <Play size={13} strokeWidth={2.4} fill="currentColor" />
          </span>
        </span>
      )}
    </div>
  );
}
