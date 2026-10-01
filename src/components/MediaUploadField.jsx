"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { uploadFileToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinaryUpload";
import PostMedia from "./PostMedia";

// A file-picker that uploads directly to Cloudinary and hands the
// resulting URL back via onUploaded. Shows an instant local preview
// while the real upload streams in the background, plus a progress
// bar — useful since video files can take a few seconds even on a
// decent connection.
//
//   shape="circle"  — round preview, for avatars (image only)
//   shape="portrait" — 4:5 preview, for post media (image or video)
export default function MediaUploadField({
  shape = "portrait",
  allowVideo = false,
  initialUrl = "",
  initialMediaType = "image",
  onUploaded, // ({ url, mediaType }) => void
  onUploadingChange, // (bool) => void — lets the parent disable submit mid-upload
  onRemove,
  label,
}) {
  const inputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [mediaType, setMediaType] = useState(initialMediaType);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const accept = allowVideo ? "image/*,video/*" : "image/*";

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let picking the same file twice re-trigger onChange
    if (!file) return;

    setError("");

    if (!isCloudinaryConfigured()) {
      setError("Uploads aren't set up yet — ask the site owner to configure Cloudinary.");
      return;
    }

    const isVideoFile = file.type.startsWith("video/");
    if (isVideoFile && !allowVideo) {
      setError("Only images are allowed here.");
      return;
    }
    if (!isVideoFile && !file.type.startsWith("image/")) {
      setError(allowVideo ? "Choose an image or video file." : "Choose an image file.");
      return;
    }

    // Free the previous local preview URL, if any, before making a new one.
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    objectUrlRef.current = localPreview;
    setPreviewUrl(localPreview);
    setMediaType(isVideoFile ? "video" : "image");

    setUploading(true);
    onUploadingChange?.(true);
    setProgress(0);

    try {
      const result = await uploadFileToCloudinary(file, { onProgress: setProgress });
      setPreviewUrl(result.url);
      setMediaType(result.mediaType);
      onUploaded?.(result);
    } catch (err) {
      setError(err.message || "Upload failed. Try again.");
      setPreviewUrl(initialUrl);
      setMediaType(initialMediaType);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  }

  function handleRemove() {
    setPreviewUrl("");
    setMediaType("image");
    setError("");
    onRemove?.();
    onUploaded?.({ url: "", mediaType: "image" });
  }

  const isCircle = shape === "circle";

  return (
    <div>
      {label && <p className="block text-sm text-thread/80 mb-1.5">{label}</p>}

      <div className="flex items-start gap-4">
        <div
          className={
            "relative shrink-0 overflow-hidden bg-ink border border-thread/15 " +
            (isCircle ? "w-20 h-20 rounded-full" : "w-28 aspect-[4/5] rounded-xl")
          }
        >
          {previewUrl ? (
            <PostMedia src={previewUrl} mediaType={mediaType} thumbnail className="w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-thread/30">
              <UploadCloud size={22} strokeWidth={1.5} />
            </span>
          )}

          {uploading && (
            <span className="absolute inset-0 grid place-items-center bg-ink/70 text-canvas">
              <Loader2 size={20} strokeWidth={2} className="animate-spin" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-thread/15 text-sm text-thread/80 px-4 py-2 hover:text-canvas hover:border-thread/30 transition-colors disabled:opacity-60"
            >
              {uploading ? "Uploading…" : previewUrl ? "Replace" : allowVideo ? "Upload photo or video" : "Upload photo"}
            </button>

            {previewUrl && !uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="grid place-items-center rounded-full border border-thread/15 w-9 h-9 text-thread/60 hover:text-clay-light hover:border-clay/30 transition-colors"
                aria-label="Remove"
              >
                <X size={15} strokeWidth={2} />
              </button>
            )}
          </div>

          {uploading && (
            <div className="mt-2.5 h-1.5 w-full max-w-[180px] rounded-full bg-thread/10 overflow-hidden">
              <div
                className="h-full bg-gold transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <p className="mt-2 text-xs text-thread/40">
            {allowVideo ? "JPG, PNG, or MP4 — up to a couple minutes long." : "JPG or PNG."}
          </p>

          {error && (
            <p className="mt-2 text-xs text-clay-light bg-clay/10 border border-clay/30 rounded-lg px-2.5 py-2">
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}
