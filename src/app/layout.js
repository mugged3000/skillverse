import { Bricolage_Grotesque, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import Loader from "@/components/Loader";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "SkillVerse — Find hands you can trust",
  description:
    "SkillVerse connects nail techs, barbers, makeup artists, lash techs, tailors, carpenters and every hand-skill pro with clients who need them. Discover, book, and grow your craft business.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={
        display.variable + " " + body.variable + " " + mono.variable + " h-full"
      }
    >
      <body className="min-h-full flex flex-col bg-ink text-thread font-body">
        <Loader />
        {children}
      </body>
    </html>
  );
}