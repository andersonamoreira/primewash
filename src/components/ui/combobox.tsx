"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ComboboxOption = { value: string; label: string; sublabel?: string };

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  emptyText = "Nada encontrado.",
}: {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q)
    );
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="mb-2"
        />
        <div className="max-h-60 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 && <p className="p-2 text-sm text-muted-foreground">{emptyText}</p>}
          {filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-surface-raised"
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  value === option.value ? "text-primary opacity-100" : "opacity-0"
                )}
              />
              <span className="flex flex-col">
                <span>{option.label}</span>
                {option.sublabel && <span className="text-xs text-muted-foreground">{option.sublabel}</span>}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
