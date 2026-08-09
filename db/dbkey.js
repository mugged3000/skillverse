// lib/prisma.js

import { PrismaClient } from './generated/index.js'; // generated Prisma Client

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// connection
prisma.$connect()
  .then(() => {
    console.log("✅ Store  Database connected successfully");
  })
  .catch((err) => {
    console.error("❌ Error connecting to StoreDatabase:", err);
    process.exit(1);
  });

  export default prisma;