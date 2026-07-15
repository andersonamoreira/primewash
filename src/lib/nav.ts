import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  Wrench,
  UserCog,
  Settings,
  BarChart3,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ordens", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/servicos", label: "Serviços", icon: Wrench, adminOnly: true },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings,
    adminOnly: true,
    children: [{ href: "/usuarios", label: "Usuários", icon: UserCog, adminOnly: true }],
  },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/ordens", label: "Ordens", icon: ClipboardList },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
];

export const MORE_MENU_ITEMS: NavItem[] = [
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/servicos", label: "Serviços", icon: Wrench, adminOnly: true },
  { href: "/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
];
