import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedEntry = {
  email: string;
  name?: string;
  classKey: string;
  team: string;
  term: number;
  cohortId: string;
  cohortName: string;
};

const defaultSeeds: SeedEntry[] = [
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

function loadSeeds(): SeedEntry[] {
  const raw = process.env.SEED_EMAILS;
  if (!raw) return defaultSeeds;

  try {
    const parsed = JSON.parse(raw) as SeedEntry[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("SEED_EMAILS must be a non-empty JSON array");
    }
    return parsed;
  } catch (error) {
    console.error("Invalid SEED_EMAILS:", error);
    process.exit(1);
  }
}

async function main() {
  const seeds = loadSeeds();

  for (const seed of seeds) {
    await prisma.allowedEmail.upsert({
      where: { email: seed.email.toLowerCase().trim() },
      update: seed,
      create: seed,
    });
    console.log(`Seeded: ${seed.email}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
