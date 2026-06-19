import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      studentId?: string;
      classKey?: string;
      team?: string | null;
      term?: number;
      role?: string;
      cohortId?: string | null;
      cohortName?: string | null;
      secondaryEmail?: string | null;
    };
  }
}
