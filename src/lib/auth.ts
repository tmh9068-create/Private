import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import { sendVerificationRequest } from "@/lib/email/send-verification";

async function findAllowedEmail(email: string) {
  return prisma.allowedEmail.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

async function ensureStudentProfile(userId: string, email: string) {
  const allowed = await findAllowedEmail(email);
  if (!allowed) return;

  await prisma.student.upsert({
    where: { userId },
    update: {
      classKey: allowed.classKey,
      team: allowed.team,
      term: allowed.term,
      cohortId: allowed.cohortId,
      cohortName: allowed.cohortName,
    },
    create: {
      userId,
      classKey: allowed.classKey,
      team: allowed.team,
      term: allowed.term,
      cohortId: allowed.cohortId,
      cohortName: allowed.cohortName,
      secondaryEmail: `${userId.slice(0, 8)}@ai-driven-school.jp`,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { name: allowed.name ?? undefined },
  });
}

const providers: NextAuthConfig["providers"] = [
  Resend({
    from: process.env.AUTH_RESEND_FROM || "noreply@example.com",
    apiKey: process.env.AUTH_RESEND_KEY,
    sendVerificationRequest,
  }),
];

if (process.env.NODE_ENV !== "production") {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase().trim();
        if (!email) return null;

        const allowed = await findAllowedEmail(email);
        if (!allowed) return null;

        const user =
          (await prisma.user.findUnique({ where: { email } })) ??
          (await prisma.user.create({
            data: {
              email,
              name: allowed.name,
              emailVerified: new Date(),
            },
          }));

        await ensureStudentProfile(user.id, email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "dev-login") {
        return true;
      }

      const allowed = await findAllowedEmail(user.email);
      if (!allowed) {
        return "/login?error=AccessDenied";
      }

      if (user.id) {
        await ensureStudentProfile(user.id, user.email);
      }

      return true;
    },
    async session({ session, user }) {
      if (!session.user) return session;

      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });

      session.user.id = user.id;
      session.user.studentId = student?.id;
      session.user.classKey = student?.classKey;
      session.user.team = student?.team;
      session.user.term = student?.term;
      session.user.role = student?.role;
      session.user.cohortId = student?.cohortId;
      session.user.cohortName = student?.cohortName;
      session.user.secondaryEmail = student?.secondaryEmail;

      return session;
    },
  },
  session: {
    strategy: "database",
  },
  trustHost: true,
});
