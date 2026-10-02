import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

if (!globalForPrisma.prisma) {
  const dbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;

