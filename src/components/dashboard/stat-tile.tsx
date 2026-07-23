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
    <Card className="flex h-full min-w-0 items-center">
      <CardContent className="w-full min-w-0 p-3 sm:p-5">
        {/* Mobile: icon + label on top, value gets the full card width below */}
        <div className="flex flex-col gap-1 sm:hidden">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex size-6 shrink-0 items-center justify-center rounded-md ${COLOR_CLASSES[color]}`}
            >
              <Icon className="size-3.5" />
            </div>
            <p className="min-w-0 flex-1 text-[11px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">
              {label}
            </p>
          </div>
          <p className="truncate text-base font-bold leading-tight text-foreground">{value}</p>
          {sublabel && <p className="truncate text-xs text-muted-foreground">{sublabel}</p>}
        </div>

        {/* Desktop: icon beside the text column */}
        <div className="hidden sm:flex sm:min-w-0 sm:items-center sm:gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${COLOR_CLASSES[color]}`}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="truncate text-xl font-bold text-foreground">{value}</p>
            {sublabel && <p className="truncate text-xs text-muted-foreground">{sublabel}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
