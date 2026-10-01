"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

function formatCraftLabel(key) {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Search bar for finding any member or professional by name.
export default function UserSearch() {
  const [query, setQuery] = useState("");
  // The result remembers which query it answers, so we can tell
  // "still searching" apart from "searched, found nothing".
  const [state, setState] = useState({ q: "", users: [], error: "" });
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const trimmed = query.trim();
  const tooShort = trimmed.length < 1;

  // Debounced search; a newer keystroke cancels the older request.
  useEffect(() => {
    if (tooShort) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/server/users/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.status === 401) {
          setState({ q: trimmed, users: [], error: "Your session expired — please log in again." });
          return;
        }
        if (!res.ok) {
          setState({ q: trimmed, users: [], error: `Search failed (error ${res.status}).` });
          return;
        }
        const data = await res.json();
        setState({ q: trimmed, users: data.users || [], error: "" });
      } catch (err) {
        if (err.name === "AbortError") return;
        setState({ q: trimmed, users: [], error: "Couldn't reach the server. Check your connection." });
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, tooShort]);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    function onPointerDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const showDropdown = open && !tooShort;
  const settled = state.q === trimmed;

  return (
    <div ref={wrapperRef} className="relative z-10">
      <div className="flex items-center gap-2.5 rounded-full border border-thread/15 bg-ink-soft px-4 py-2.5 focus-within:border-gold transition-colors">
        <Search size={16} strokeWidth={2} className="text-thread/45 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search members and professionals"
          aria-label="Search members and professionals"
          className="flex-1 min-w-0 bg-transparent text-sm text-canvas placeholder:text-thread/35 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setState({ q: "", users: [], error: "" });
            }}
            aria-label="Clear search"
            className="text-thread/45 hover:text-canvas transition-colors"
          >
            <X size={15} strokeWidth={2} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-2xl border border-thread/10 bg-ink-soft shadow-[0_24px_60px_-16px_rgba(0,0,0,0.6)] p-2 max-h-80 overflow-y-auto">
          {!settled ? (
            <p className="px-3 py-3 text-sm text-thread/50">Searching…</p>
          ) : state.error ? (
            <p className="px-3 py-3 text-sm text-clay-light">{state.error}</p>
          ) : state.users.length === 0 ? (
            <p className="px-3 py-3 text-sm text-thread/50">
              No one found for &ldquo;{trimmed}&rdquo;.
            </p>
          ) : (
            state.users.map((u) => (
              <Link
                key={u.id}
                href={u.craftKey ? `/professionals/${u.id}` : `/members/${u.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-thread/5 transition-colors"
              >
                <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-gold/20 text-gold-light font-display text-sm font-semibold overflow-hidden">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    u.name.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-canvas truncate">{u.name}</p>
                  <p className="text-xs text-thread/50">
                    {u.craftKey ? `Professional · ${formatCraftLabel(u.craftKey)}` : "Member"}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}