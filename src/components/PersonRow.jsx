import Link from "next/link";

function formatCraftLabel(key) {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// One row in a followers / following list. Professionals link to their
// professional page, everyone else to their member page.
export default function PersonRow({ person }) {
  const isPro = Boolean(person.professionalProfile);
  return (
    <Link
      href={isPro ? `/professionals/${person.id}` : `/members/${person.id}`}
      className="flex items-center gap-3 rounded-xl border border-thread/10 bg-ink-soft px-4 py-3 hover:border-thread/25 transition-colors"
    >
      <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-gold/20 text-gold-light font-display text-sm font-semibold overflow-hidden">
        {person.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
        ) : (
          person.name.charAt(0).toUpperCase()
        )}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-canvas truncate">{person.name}</p>
        <p className="text-xs text-thread/50">
          {isPro ? formatCraftLabel(person.professionalProfile.craftKey) : "Member"}
        </p>
      </div>
    </Link>
  );
}