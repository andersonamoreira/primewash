import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const COLOR_CLASSES = {
  blue: "bg-stat-blue/15 text-stat-blue",
  green: "bg-stat-green/15 text-stat-green",
  violet: "bg-stat-violet/15 text-stat-violet",
  orange: "bg-stat-orange/15 text-stat-orange",
  teal: "bg-stat-teal/15 text-stat-teal",
  gold: "bg-accent/15 text-pw-gold-400",
} as const;

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  color?: keyof typeof COLOR_CLASSES;
}) {
  return (
    <Card className="flex h-full items-center">
      <CardContent className="flex w-full items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${COLOR_CLASSES[color]}`}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase leading-tight tracking-wide text-muted-foreground sm:text-xs sm:tracking-wide">
            {label}
          </p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {sublabel && (
            <p className="truncate text-xs text-muted-foreground">{sublabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
