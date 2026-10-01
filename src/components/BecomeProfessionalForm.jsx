"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// The list of crafts someone can pick from. Just a plain array for
// now — no database table needed for this.
const CRAFTS = [
  { key: "nail-tech", name: "Nail Tech" },
  { key: "lash-artist", name: "Lash Artist" },
  { key: "makeup-artist", name: "Makeup Artist" },
  { key: "barber", name: "Barber" },
  { key: "hair-stylist", name: "Hair Stylist" },
  { key: "tailor", name: "Tailor" },
];

export default function BecomeProfessionalForm() {
  const router = useRouter();
  const [craftKey, setCraftKey] = useState(CRAFTS[0].key);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!craftKey || !bio.trim() || !location.trim()) {
      setError("Craft, bio, and location are all required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/server/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ craftKey, bio, location }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      // The route hands back the new user id and the craft's real
      // display name — go straight to the new profile, not the feed.
      router.push(`/professionals/${data.userId}?welcome=${encodeURIComponent(data.craftLabel)}`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="craft" className="block text-sm text-thread/80 mb-1.5">
          Craft
        </label>
        <select
          id="craft"
          value={craftKey}
          onChange={(e) => setCraftKey(e.target.value)}
          className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 text-canvas outline-none focus:border-gold transition-colors"
        >
          {CRAFTS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm text-thread/80 mb-1.5">
          Short bio
        </label>
        <textarea
          id="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="e.g. 3 years doing gel and acrylic sets, based in Nsukka"
          className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors resize-none"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm text-thread/80 mb-1.5">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Nsukka, near UNN main gate"
          className="w-full rounded-xl border border-thread/15 bg-ink-soft px-4 py-3 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-clay-light bg-clay/10 border border-clay/30 rounded-lg px-3 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-gold text-ink font-semibold py-3.5 hover:bg-gold-light transition-colors disabled:opacity-60"
      >
        {submitting ? "Creating profile…" : "Create my professional profile"}
      </button>
    </form>
  );
}