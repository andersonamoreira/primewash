"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

function maskCPF(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

type CpfInputProps = {
  id?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
};

export function CpfInput({
  id,
  name,
  defaultValue,
  value,
  onValueChange,
  placeholder = "000.000.000-00",
}: CpfInputProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => maskCPF(defaultValue ?? ""));
  const display = isControlled ? maskCPF(value) : internal;

  return (
    <Input
      id={id}
      name={name}
      inputMode="numeric"
      placeholder={placeholder}
      value={display}
      onChange={(e) => {
        const masked = maskCPF(e.target.value);
        if (!isControlled) setInternal(masked);
        onValueChange?.(masked);
      }}
    />
  );
}
