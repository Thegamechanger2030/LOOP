// Single shared Prisma client. Next.js hot-reloads modules in dev, which
// would otherwise open a new DB connection on every save — so we cache
// the client on `globalThis` outside of production.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
