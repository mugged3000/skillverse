
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUploadField from "./MediaUploadField";

// Shown only on your own profile page, only if you're a professional.
export default function CreatePostForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [mediaUploading, setMediaUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!imageUrl.trim()) {
      setError("Add a photo or video first.");
      return;
    }
    if (mediaUploading) {
      setError("Hang on — the upload is still finishing.");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch("/server/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl.trim(), mediaType, caption: caption.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setPosting(false);
        return;
      }

      setImageUrl("");
      setMediaType("image");
      setCaption("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setPosting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-2xl border border-dashed border-thread/20 py-3.5 text-sm font-semibold text-gold-light hover:border-gold/40 hover:text-gold transition-colors"
      >
        + New post
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-2xl border border-thread/10 bg-ink-soft p-5"
    >
      <MediaUploadField
        shape="portrait"
        allowVideo
        label="Photo or video"
        initialUrl={imageUrl}
        initialMediaType={mediaType}
        onUploaded={({ url, mediaType: type }) => {
          setImageUrl(url);
          setMediaType(type);
        }}
        onUploadingChange={setMediaUploading}
      />

      <div>
        <label htmlFor="post-caption" className="block text-sm text-thread/80 mb-1.5">
          Caption
        </label>
        <textarea
          id="post-caption"
          rows={2}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's this one about?"
          className="w-full rounded-xl border border-thread/15 bg-ink px-4 py-2.5 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-clay-light bg-clay/10 border border-clay/30 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={posting || mediaUploading}
          className="rounded-full bg-gold text-ink text-sm font-semibold px-5 py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {posting ? "Posting…" : "Post"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-thread/15 text-thread/70 text-sm px-5 py-2.5 hover:text-canvas transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}