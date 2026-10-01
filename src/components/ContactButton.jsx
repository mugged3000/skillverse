import { MessageCircle } from "lucide-react";
import { contactLabel } from "@/lib/contactLink";

// "Chat on WhatsApp" / "Message on Instagram" / ... — renders nothing
// when the person hasn't added a contact link.
export default function ContactButton({ url }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold-light hover:bg-gold/20 transition-colors"
    >
      <MessageCircle size={15} strokeWidth={2} />
      {contactLabel(url)}
    </a>
  );
}