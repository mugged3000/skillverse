"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUploadField from "./MediaUploadField";

// Shown only on your own profile page.
export default function EditProfileForm({
  initialAvatarUrl,
  initialBio,
  initialLocation,
  initialContactLink,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bio, setBio] = useState(initialBio || "");
  const [location, setLocation] = useState(initialLocation || "");
  const [contactLink, setContactLink] = useState(initialContactLink || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!bio.trim() || !location.trim()) {
      setError("Bio and location can't be empty.");
      return;
    }
    if (avatarUploading) {
      setError("Hang on — the photo upload is still finishing.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/server/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: avatarUrl.trim() || null, bio, location, contactLink }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setSaving(false);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 text-sm font-semibold text-gold-light hover:text-gold transition-colors"
      >
        Edit profile
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl border border-thread/10 bg-ink-soft p-5">
      <MediaUploadField
        shape="circle"
        allowVideo={false}
        label="Profile picture"
        initialUrl={avatarUrl}
        onUploaded={({ url }) => setAvatarUrl(url)}
        onUploadingChange={setAvatarUploading}
      />

      <div>
        <label htmlFor="edit-bio" className="block text-sm text-thread/80 mb-1.5">
          Bio
        </label>
        <textarea
          id="edit-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-xl border border-thread/15 bg-ink px-4 py-2.5 text-canvas outline-none focus:border-gold transition-colors resize-none"
        />
      </div>

      <div>
        <label htmlFor="edit-location" className="block text-sm text-thread/80 mb-1.5">
          Location
        </label>
        <input
          id="edit-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-xl border border-thread/15 bg-ink px-4 py-2.5 text-canvas outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label htmlFor="edit-contact" className="block text-sm text-thread/80 mb-1.5">
          Contact link <span className="text-thread/40">(optional)</span>
        </label>
        <input
          id="edit-contact"
          type="text"
          maxLength={200}
          value={contactLink}
          onChange={(e) => setContactLink(e.target.value)}
          placeholder="WhatsApp number or any link, e.g. 0803 000 0000"
          className="w-full rounded-xl border border-thread/15 bg-ink px-4 py-2.5 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
        />
        <p className="text-xs text-thread/40 mt-1.5">
          Where people can reach you — a phone number becomes a WhatsApp chat link. Instagram,
          Telegram or any other link works too.
        </p>
      </div>

      {error && (
        <p className="text-sm text-clay-light bg-clay/10 border border-clay/30 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || avatarUploading}
          className="rounded-full bg-gold text-ink text-sm font-semibold px-5 py-2.5 hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
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