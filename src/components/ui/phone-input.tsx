"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

function maskPhoneBR(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

type PhoneInputProps = {
  id?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function PhoneInput({
  id,
  name,
  defaultValue,
  value,
  onValueChange,
  required,
  placeholder = "(11) 91234-5678",
}: PhoneInputProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() => maskPhoneBR(defaultValue ?? ""));
  const display = isControlled ? maskPhoneBR(value) : internal;

  return (
    <Input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      placeholder={placeholder}
      required={required}
      value={display}
      onChange={(e) => {
        const masked = maskPhoneBR(e.target.value);
        if (!isControlled) setInternal(masked);
        onValueChange?.(masked);
      }}
    />
  );
}
