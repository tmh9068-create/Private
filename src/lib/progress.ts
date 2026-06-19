import { prisma } from "@/lib/prisma";

export async function getUserProgressMap(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { pageProgress: true },
  });

  if (!student) return {} as Record<string, boolean>;

  return Object.fromEntries(
    student.pageProgress.map((item) => [item.pageSlug, item.completed])
  );
}

export async function getProgressStats(userId: string) {
  const progress = await getUserProgressMap(userId);
  const completed = Object.values(progress).filter(Boolean).length;
  const total = Object.keys(progress).length;
  return { completed, total, progress };
}
