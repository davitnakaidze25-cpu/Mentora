import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS:", users.length);
  const tutors = await prisma.tutorProfile.findMany();
  console.log("TUTOR PROFILES:", tutors.length);
  for (const t of tutors) {
    console.log(" - Tutor:", t.id, t.verificationStatus, t.userId);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
