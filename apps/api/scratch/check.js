const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const job = await prisma.job.findFirst({
    where: { status: 'FAILED' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(job);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
