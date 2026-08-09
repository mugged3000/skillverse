// Run with: node db/seedPosts.js
// Creates a handful of fake "professional" users + sample posts so the
// feed has something to browse/like/comment on before real signups can
// post (that unlocks once "Become a Professional" exists).

import prisma from "./dbkey.js";
import { hashPassword } from "../src/lib/password.js";

const SAMPLE_USERS = [
  { name: "Chioma Eze", email: "seed+chioma@skillverse.test" },
  { name: "Tunde Bello", email: "seed+tunde@skillverse.test" },
  { name: "Amara Nwosu", email: "seed+amara@skillverse.test" },
];

const SAMPLE_POSTS = [
  {
    email: "seed+chioma@skillverse.test",
    imageUrl: "https://picsum.photos/seed/nails1/600/750",
    caption: "Gel set for a client this morning ✨",
  },
  {
    email: "seed+chioma@skillverse.test",
    imageUrl: "https://picsum.photos/seed/nails2/600/750",
    caption: "Chrome finish — booking slots open this week.",
  },
  {
    email: "seed+tunde@skillverse.test",
    imageUrl: "https://picsum.photos/seed/barber1/600/750",
    caption: "Clean fade, walk-ins welcome.",
  },
  {
    email: "seed+amara@skillverse.test",
    imageUrl: "https://picsum.photos/seed/makeup1/600/750",
    caption: "Bridal look from last weekend 💄",
  },
];

async function main() {
  const placeholderPassword = await hashPassword("seed-account-not-for-login");

  for (const u of SAMPLE_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: placeholderPassword,
      },
    });
  }

  for (const p of SAMPLE_POSTS) {
    const author = await prisma.user.findUnique({ where: { email: p.email } });
    await prisma.post.create({
      data: {
        authorId: author.id,
        imageUrl: p.imageUrl,
        caption: p.caption,
      },
    });
  }

  console.log(`Seeded ${SAMPLE_USERS.length} sample users and ${SAMPLE_POSTS.length} posts.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());