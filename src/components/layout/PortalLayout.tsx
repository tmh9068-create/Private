import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-page">
      <Sidebar user={session.user} />
      <main className="lg:pl-sidebar">
        <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
