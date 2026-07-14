"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon,
  className,
  activeClassName,
  inactiveClassName,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} className={cn(className, isActive ? activeClassName : inactiveClassName)}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
