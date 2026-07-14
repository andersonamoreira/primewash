import Link from "next/link";
import { UserCog, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SETTINGS_ITEMS = [
  {
    href: "/usuarios",
    label: "Usuários",
    description: "Gerencie quem tem acesso ao sistema e seus perfis (Administrador ou Comum).",
    icon: UserCog,
  },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ajustes gerais e administrativos do sistema.
      </p>

      <div className="flex flex-col gap-3">
        {SETTINGS_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-pw-blue-300">
                  <item.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
