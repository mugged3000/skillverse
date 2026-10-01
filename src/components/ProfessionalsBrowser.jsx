"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Users, X } from "lucide-react";

// Search box + results grid for /professionals. Starts out showing the
// server-rendered initial list (most recent professionals, capped at
// 100); typing a name re-queries /server/professionals?q= so people
// can find someone outside that initial batch, debounced so it's not
// firing a request on every keystroke.
export default function ProfessionalsBrowser({ initialProfessionals, initialTotal }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = no results landed yet
  const [searchTotal, setSearchTotal] = useState(0);
  const [erroredQuery, setErroredQuery] = useState(null); // the query that last failed, if any
  // The query string that searchResults currently corresponds to — lets
  // "loading" be computed instead of tracked as its own state that has
  // to be flipped on and off around the fetch.
  const [resolvedQuery, setResolvedQuery] = useState(null);

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery !== "";
  const professionals = isSearching ? searchResults ?? [] : initialProfessionals;
  const total = isSearching ? searchTotal : initialTotal;
  const showLoading = isSearching && resolvedQuery !== trimmedQuery && erroredQuery !== trimmedQuery;
  const showError = isSearching && erroredQuery === trimmedQuery;

  useEffect(() => {
    // Empty query — nothing to fetch; the render above already falls
    // back to the server-rendered initial list. Just cancel any
    // in-flight debounce so a stale search doesn't land later.
    if (!isSearching) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    const thisRequestId = ++requestIdRef.current;
    const trimmed = trimmedQuery;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/server/professionals?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (requestIdRef.current !== thisRequestId) return; // a newer keystroke won the race
        setSearchResults(data.professionals || []);
        setSearchTotal(data.total ?? data.professionals?.length ?? 0);
        setResolvedQuery(trimmed);
      } catch {
        if (requestIdRef.current !== thisRequestId) return;
        setErroredQuery(trimmed);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [trimmedQuery, isSearching]);

  const showingCap = !isSearching && initialTotal > initialProfessionals.length;

  return (
    <div>
      <div className="relative">
        <Search
          size={17}
          strokeWidth={1.75}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-thread/40"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search professionals by name…"
          className="w-full rounded-full border border-thread/15 bg-ink-soft pl-11 pr-10 py-3 text-canvas placeholder:text-thread/35 outline-none focus:border-gold transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-thread/40 hover:text-canvas transition-colors"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-thread/45">
        {isSearching
          ? showLoading
            ? "Searching…"
            : `${professionals.length} result${professionals.length === 1 ? "" : "s"} for “${query.trim()}”`
          : showingCap
          ? `Showing the ${professionals.length} most recent of ${total} professionals — can’t find who you’re looking for? Search their name above.`
          : `${total} professional${total === 1 ? "" : "s"} on SkillVerse.`}
      </p>

      {showError && (
        <p className="mt-4 text-sm text-clay-light bg-clay/10 border border-clay/30 rounded-lg px-3.5 py-2.5">
          Couldn&rsquo;t load results. Try again.
        </p>
      )}

      {!showError && professionals.length === 0 && !showLoading && (
        <div className="mt-8 rounded-2xl border border-dashed border-thread/15 px-6 py-16 text-center">
          <p className="font-display text-lg text-canvas">No one matches that search</p>
          <p className="mt-2 text-sm text-thread/50">Try a different spelling or a shorter name.</p>
        </div>
      )}

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {professionals.map((pro) => (
          <Link
            key={pro.userId}
            href={`/professionals/${pro.userId}`}
            className="flex items-start gap-3.5 rounded-2xl border border-thread/10 bg-ink-soft p-4 transition-transform hover:-translate-y-0.5 hover:border-thread/20"
          >
            <span className="grid place-items-center w-12 h-12 shrink-0 rounded-full bg-gold/20 text-gold-light font-display text-base font-semibold overflow-hidden">
              {pro.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
              ) : (
                pro.name.charAt(0).toUpperCase()
              )}
            </span>

            <div className="min-w-0">
              <p className="font-medium text-canvas truncate">{pro.name}</p>
              <p className="text-xs text-gold-light mt-0.5">{pro.craftLabel}</p>
              {pro.location && (
                <p className="flex items-center gap-1 text-xs text-thread/50 mt-1.5 truncate">
                  <MapPin size={11} strokeWidth={1.75} className="shrink-0" />
                  {pro.location}
                </p>
              )}
              <p className="flex items-center gap-1 text-xs text-thread/40 mt-1">
                <Users size={11} strokeWidth={1.75} className="shrink-0" />
                {pro.followerCount} follower{pro.followerCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
