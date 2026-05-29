import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";

// Componente puramente para impressão — sem classes dark mode, fundo branco limpo
const CardPrintView = React.forwardRef(({ user, business }, ref) => {
  const validityText = user.expiration_date
    ? format(new Date(user.expiration_date), "MM/yyyy")
    : "—";
  const regText = user.registration_date
    ? format(new Date(user.registration_date), "dd/MM/yyyy")
    : "—";
  const expText = user.expiration_date
    ? format(new Date(user.expiration_date), "dd/MM/yyyy")
    : "—";

  const qrData = JSON.stringify({
    cartao: user.card_number,
    titular: user.full_name,
    cpf: user.cpf,
    validade: validityText,
    status: user.status,
  });

  const businessName = business?.business_name || "Cartão Desconto";
  const businessPhone = business?.phone || "";
  const businessAddress = business?.address || "";
  const businessEmail = business?.email || "";

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: " #ffffff",
        color: " #1a1a2e",
        padding: "40px",
        width: "794px",          // A4 portrait width in px @96dpi
        minHeight: "1123px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header com dados da empresa ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", paddingBottom: "20px", borderBottom: "2px solid  #D4A853" }}>