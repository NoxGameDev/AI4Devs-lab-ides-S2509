const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCandidates() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    console.log(`\nTotal candidates found: ${candidates.length}\n`);
    candidates.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.firstName} ${c.lastName}`);
      console.log(`   Email: ${c.email}`);
      console.log(`   Phone: ${c.phone}`);
      console.log(`   Created: ${c.createdAt}`);
      console.log(`   Resume: ${c.resumePath || 'No resume uploaded'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCandidates();

