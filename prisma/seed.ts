import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seeds = [
    {
      email: "dev-fri@example.com",
      name: "開発太郎",
      classKey: "fri",
      team: "bat",
      term: 1,
      cohortId: "t1-fri",
      cohortName: "金曜クラス",
    },
    {
      email: "dev-sat@example.com",
      name: "開発花子",
      classKey: "sat",
      team: "cat",
      term: 1,
      cohortId: "t1-sat",
      cohortName: "土曜クラス",
    },
  ];

  for (const seed of seeds) {
    await prisma.allowedEmail.upsert({
      where: { email: seed.email },
      update: seed,
      create: seed,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
