"use client";

import Link from "next/link";
import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";

export function SidebarUserPanel({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}) {
  return (
    <div className="border-t border-border-subtle p-3">
      <div className="flex items-center gap-2.5 px-1 py-2">
        <Avatar>
          <AvatarFallback>{initials(name) || <UserIcon className="size-4" />}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1">
        <ThemeToggle />
        {role === "ADMIN" && (
          <Button asChild variant="ghost" size="icon" title="Configurações">
            <Link href="/configuracoes">
              <Settings className="size-4" />
            </Link>
          </Button>
        )}
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            title="Sair"
            className="text-danger hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
      <p className="mt-2 px-1 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} Solvit Development
      </p>
    </div>
  );
}
