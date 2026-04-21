const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const jobCount = await prisma.job.count();
    
    console.log('Database Audit Results:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Projects: ${projectCount}`);
    console.log(`- Jobs: ${jobCount}`);
    
    if (userCount > 0) {
      const lastUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
      console.log(`- Last User Registered: ${lastUser.email} at ${lastUser.createdAt}`);
    }
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
