import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt="Prime Wash"
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-md object-cover"
        priority
      />
      {showText && (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-wide text-foreground">
            PRIME <span className="text-pw-blue-400">WASH</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Estética de Motos
          </span>
        </span>
      )}
    </div>
  );
}
