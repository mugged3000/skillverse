"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUploadField from "./MediaUploadField";
import { CRAFTS } from "@/lib/crafts";

const BIO_MAX = 160;
const GOAL_MAX = 120;

// Rotating placeholders so the optional goal box feels like a nudge,
// not a form field.
const GOAL_PROMPTS = [
  "Your dream with this craft — e.g. \"Open my own studio by 2028\"",
  "What are you working towards? e.g. \"Master every technique, one day at a time\"",
  "A goal to keep you going — e.g. \"Be the best in my city\"",
];

// Shown only on a regular member's own profile. Everything is optional
// here (unlike EditProfileForm for professionals, where bio + location
// are required).
export default function MemberEditForm({
  initialAvatarUrl,
  initialBio,
  initialLocation,
  initialInterests,
  initialGoals,
  initialContactLink,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bio, setBio] = useState(initialBio || "");
  const [location, setLocation] = useState(initialLocation || "");
  const [contactLink, setContactLink] = useState(initialContactLink || "");
  const [interests, setInterests] = useState(initialInterests || []);
  const [goals, setGoals] = useState(initialGoals || {});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleInterest(key) {
    setInterests((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));
  }

  function setGoal(key, value) {
    setGoals((cur) => ({ ...cur, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (avatarUploading) {
      setError("Hang on — the photo upload is still finishing.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/server/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: avatarUrl.trim() || null,
          bio,
          location,
          contactLink,
          interests,
          interestGoals: goals,
        }),
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
        className="mt-6 rounded-full border border-thread/15 px-5 py-2 text-sm font-semibold text-gold-light hover:border-gold/40 hover:text-gold transition-colors"
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
        <label htmlFor="member-bio" className="flex items-center justify-between text-sm text-thread/80 mb-1.5">
          <span>Bio</span>
          <span className="text-xs text-thread/40 tabular-nums">
            {bio.length}/{BIO_MAX}
          </span>
        </label>
        <textarea
          id="member-bio"
          rows={3}
          maxLength={BIO_MAX}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people a little about you…"
          className="w-full rounded-xl border border-thread/15 bg-ink px-4 py-2.5 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors resize-none"
        />
      </div>

      <div>
        <label htmlFor="member-location" className="block text-sm text-thread/80 mb-1.5">
          Location
        </label>
        <input
          id="member-location"
          type="text"
          maxLength={60}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Lekki, Lagos"
          className="w-full rounded-xl border border-thread/15 bg-ink px-4 py-2.5 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
        />
      </div>

      <div>
        <label htmlFor="member-contact" className="block text-sm text-thread/80 mb-1.5">
          Contact link <span className="text-thread/40">(optional)</span>
        </label>
        <input
          id="member-contact"
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

      <div>
        <p className="text-sm text-thread/80">
          Crafts you&rsquo;re interested in <span className="text-thread/40">(optional)</span>
        </p>
        <p className="text-xs text-thread/40 mt-0.5 mb-2">
          Pick any that inspire you, then add a line about your dream or goal.
        </p>
        <div className="flex flex-wrap gap-2">
          {CRAFTS.map((c) => {
            const active = interests.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => toggleInterest(c.key)}
                aria-pressed={active}
                className={
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
                  (active
                    ? "border-gold bg-gold/15 text-gold-light"
                    : "border-thread/15 text-thread/60 hover:text-canvas hover:border-thread/30")
                }
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {interests.length > 0 && (
          <div className="mt-4 space-y-3">
            {interests.map((key) => {
              const craft = CRAFTS.find((c) => c.key === key);
              if (!craft) return null;
              const value = goals[key] || "";
              return (
                <div key={key}>
                  <label
                    htmlFor={`goal-${key}`}
                    className="flex items-center justify-between text-xs text-gold-light mb-1"
                  >
                    <span>{craft.name} — your goal</span>
                    <span className="text-thread/40 tabular-nums">
                      {value.length}/{GOAL_MAX}
                    </span>
                  </label>
                  <input
                    id={`goal-${key}`}
                    type="text"
                    maxLength={GOAL_MAX}
                    value={value}
                    onChange={(e) => setGoal(key, e.target.value)}
                    placeholder={GOAL_PROMPTS[CRAFTS.findIndex((c) => c.key === key) % GOAL_PROMPTS.length]}
                    className="w-full rounded-xl border border-thread/15 bg-ink px-4 py-2.5 text-sm text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
                  />
                </div>
              );
            })}
          </div>
        )}
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