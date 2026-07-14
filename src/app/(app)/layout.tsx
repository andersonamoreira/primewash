import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AppShell
      name={session.user.name ?? "Usuário"}
      email={session.user.email ?? ""}
      role={session.user.role}
    >
      {children}
    </AppShell>
  );
}
