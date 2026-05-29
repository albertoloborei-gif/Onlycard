import React from "react";
import { Input } from "@/components/ui/input";

export default function NameInput({ value, onChange, ...props }) {
  const handleChange = (e) => {
    const newValue = e.target.value.replace(/[0-9]/g, "");
    onChange({ ...e, target: { ...e.target, value: newValue } });
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
}