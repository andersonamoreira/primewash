"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/layout/nav-link";
import { SidebarUserPanel } from "@/components/layout/sidebar-user-panel";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  name,
  email,
}: {
  role: "ADMIN" | "USER";
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");
  const [openGroup, setOpenGroup] = useState<string | null>(
    () => items.find((item) => item.children?.some((c) => pathname.startsWith(c.href)))?.href ?? null
  );

  return (
    <aside className="hidden w-64 flex-col border-r border-border-subtle bg-surface/60 lg:flex">
      <div className="flex h-16 items-center border-b border-border-subtle px-5">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            const childItems = item.children.filter((c) => !c.adminOnly || role === "ADMIN");
            const isGroupActive = pathname.startsWith(item.href) || childItems.some((c) => pathname.startsWith(c.href));
            const isOpen = openGroup === item.href || isGroupActive;
            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : item.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isGroupActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                  )}
                >
                  <item.icon className="size-[1.15em] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="mt-1 flex flex-col gap-1 border-l border-border-subtle pl-4">
                    {childItems.map((child) => (
                      <NavLink
                        key={child.href}
                        href={child.href}
                        label={child.label}
                        icon={<child.icon className="size-[1.1em] shrink-0" />}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        activeClassName="bg-primary/15 text-primary"
                        inactiveClassName="text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon className="size-[1.15em] shrink-0" />}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              activeClassName="bg-primary text-primary-foreground shadow-sm"
              inactiveClassName="text-muted-foreground hover:bg-surface-raised hover:text-foreground"
            />
          );
        })}
      </nav>
      <SidebarUserPanel name={name} email={email} role={role} />
    </aside>
  );
}
