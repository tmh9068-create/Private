import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { pageProgress: true },
  });

  if (!student) {
    return NextResponse.json({ progress: {} });
  }

  const progress = Object.fromEntries(
    student.pageProgress.map((item) => [item.pageSlug, item.completed])
  );

  return NextResponse.json({ progress });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const pageSlug = body.pageSlug as string;
  const completed = Boolean(body.completed);

  if (!pageSlug) {
    return NextResponse.json({ error: "pageSlug is required" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const progress = await prisma.pageProgress.upsert({
    where: {
      userId_pageSlug: { userId: student.userId, pageSlug },
    },
    update: { completed },
    create: {
      userId: student.userId,
      pageSlug,
      completed,
    },
  });

  return NextResponse.json({ progress });
}
