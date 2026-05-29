import React from "react";
import { Input } from "@/components/ui/input";

export function formatPhone(value) {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length === 0) return "";
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

export default function PhoneInput({ value, onChange, ...props }) {
  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => onChange(formatPhone(e.target.value))}
      placeholder="(00) 00000-0000"
    />
  );
}