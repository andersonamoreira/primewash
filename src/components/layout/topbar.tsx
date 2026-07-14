import { Logo } from "@/components/logo";

export function Topbar() {
  return (
    <header className="flex h-16 items-center border-b border-border-subtle bg-surface/60 px-4 sm:px-6 lg:hidden">
      <Logo showText={false} />
    </header>
  );
}
