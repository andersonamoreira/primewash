"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, LogOut, X, User as UserIcon } from "lucide-react";
import { MOBILE_NAV_ITEMS, MORE_MENU_ITEMS } from "@/lib/nav";
import { cn, initials } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export function BottomNav({
  role,
  name,
  email,
}: {
  role: "ADMIN" | "USER";
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreItems = MORE_MENU_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");
  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-x-0 bottom-16 z-40 mx-4 rounded-xl border border-border-strong bg-surface-raised p-2 shadow-xl transition-all lg:hidden",
          moreOpen ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar>
            <AvatarFallback>{initials(name) || <UserIcon className="size-4" />}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <button onClick={() => setMoreOpen(false)} className="p-1 text-muted-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="my-1 border-t border-border-subtle" />

        {moreItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-surface"
          >
            <item.icon className="size-4" /> {item.label}
          </Link>
        ))}

        <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground">
          Tema
          <ThemeToggle />
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-danger hover:bg-surface"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </form>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border-subtle bg-surface/95 backdrop-blur-sm lg:hidden">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
            isMoreActive || moreOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className="size-5" />
          Mais
        </button>
      </nav>
    </>
  );
}
