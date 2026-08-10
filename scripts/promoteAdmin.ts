import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'nakaidze.davit1@students.gov.ge';
  const result = await prisma.user.updateMany({
    where: { email },
    data: { role: 'ADMIN' },
  });
  if (result.count === 0) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`✅ Successfully promoted ${email} to ADMIN role.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
