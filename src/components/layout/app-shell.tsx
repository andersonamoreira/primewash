import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({
  name,
  email,
  role,
  children,
}: {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} name={name} email={email} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>
      </div>
      <BottomNav role={role} name={name} email={email} />
    </div>
  );
}
