
// One-off cleanup: removes the sample posts (and the fake accounts
// that made them) created by db/seed.js — now that real professionals
// can post for themselves, the placeholder data isn't needed anymore.
//
// Deliberately scoped to only the "seed+...@skillverse.test" accounts
// created by seed.js — never touches real users or their real posts,
// even if you run this again later.
//
// Run with: node db/clearSeedPosts.js

import prisma from "./dbkey.js";

async function main() {
  const seedUsers = await prisma.user.findMany({
    where: { email: { startsWith: "seed+" } },
    select: { id: true, email: true },
  });

  if (seedUsers.length === 0) {
    console.log("No seed accounts found — nothing to clean up.");
    return;
  }

  const seedUserIds = seedUsers.map((u) => u.id);

  const { count: postCount } = await prisma.post.deleteMany({
    where: { authorId: { in: seedUserIds } },
  });

  const { count: userCount } = await prisma.user.deleteMany({
    where: { id: { in: seedUserIds } },
  });

  console.log(`Removed ${postCount} seed post(s) and ${userCount} seed account(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());