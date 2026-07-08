const { PrismaClient } = require('@prisma/client');

// در توسعه، Next.js فایل‌ها را hot-reload می‌کند که باعث ساخت چند instance از
// PrismaClient می‌شود. این الگو singleton بودن آن را در طول توسعه تضمین می‌کند.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = { prisma };
