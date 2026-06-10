import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export function formatCPF(value) {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

export function validateCPF(cpf) {
  const nums = cpf.replace(/\D/g, "");
  if (nums.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(nums)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(nums.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;
  
  if (digit1 !== parseInt(nums.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(nums.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;
  
  return digit2 === parseInt(nums.charAt(10));
}

export default function CPFInput(props) {
  const { value, onChange, onBlur, className, ...restProps } = props;
  const [error, setError] = useState("");

  const handleBlur = (e) => {
    const cpf = e.target.value;
    if (cpf && !validateCPF(cpf)) {
      setError("CPF inválido");
    } else {
      setError("");
    }
    if (onBlur) onBlur(e);
  };

  return (
    <div>
      <Input
        {...restProps}
        value={value}
        onChange={(e) => onChange(formatCPF(e.target.value))}
        onBlur={handleBlur}
        placeholder="000.000.000-00"
        className={error ? "border-red-500" : className}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
