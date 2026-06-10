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
        background: "#ffffff",
        color: "#1a1a2e",
        padding: "40px",
        width: "794px",          // A4 portrait width in px @96dpi
        minHeight: "1123px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header com dados da empresa ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", paddingBottom: "20px", borderBottom: "2px solid #D4A853" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {business?.logo_url && (
            <img src={business.logo_url} alt="Logo" style={{ width: "60px", height: "60px", objectFit: "contain", borderRadius: "8px" }} />
          )}
          <div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e", letterSpacing: "-0.5px" }}>{businessName}</div>
            {businessAddress && <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{businessAddress}</div>}
            {(businessPhone || businessEmail) && (
              <div style={{ fontSize: "11px", color: "#666" }}>
                {businessPhone}{businessPhone && businessEmail ? " · " : ""}{businessEmail}
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "2px" }}>Cartão de Desconto</div>
          <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>Emitido em {format(new Date(), "dd/MM/yyyy")}</div>
        </div>
      </div>

      {/* ── Cartão físico simulado ── */}
      <div style={{
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto 36px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "28px 32px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        {/* Círculos decorativos */}
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(212,168,83,0.15)" }} />
        <div style={{ position: "absolute", bottom: "-20px", left: "-20px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(212,168,83,0.08)" }} />

        {/* Chip + logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Chip simulado */}
            <div style={{ width: "40px", height: "30px", borderRadius: "6px", background: "linear-gradient(135deg, #D4A853, #E8C97A)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)" }} />
          </div>
          <div style={{ fontSize: "10px", color: "#D4A853", textTransform: "uppercase", letterSpacing: "3px", fontWeight: "700" }}>
            Desconto
          </div>
        </div>

        {/* Número do cartão */}
        <div style={{ fontSize: "22px", fontFamily: "'Courier New', monospace", letterSpacing: "4px", color: "#fff", marginBottom: "20px", fontWeight: "700" }}>
          {user.card_number || "0000-0000-0000-0000"}
        </div>

        {/* Titular + Validade */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "8px", color: "#D4A853", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "3px" }}>Titular</div>
            <div style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>{user.full_name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "8px", color: "#D4A853", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "3px" }}>Válido até</div>
            <div style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "2px" }}>{validityText}</div>
            {(user.city || user.state) && (
              <div style={{ fontSize: "9px", color: "#D4A853", marginTop: "4px" }}>
                {[user.city, user.state].filter(Boolean).join(" - ")}
              </div>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div style={{ marginTop: "14px" }}>
          <span style={{
            fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px",
            padding: "3px 10px", borderRadius: "20px",
            background: user.status === "Ativo" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
            color: user.status === "Ativo" ? "#34d399" : "#f87171",
            border: `1px solid ${user.status === "Ativo" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
          }}>
            ● {user.status || "Ativo"}
          </span>
        </div>
      </div>

      {/* ── Dados do titular + QR Code ── */}
      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", marginBottom: "32px" }}>
        {/* Dados */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: "#D4A853", marginBottom: "14px" }}>
            Dados do Titular
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Nome Completo", user.full_name],
                ["CPF", user.cpf ? `${user.cpf.slice(0,3)}.${user.cpf.slice(3,6)}.${user.cpf.slice(6,9)}-${user.cpf.slice(9)}` : "—"],
                ["Telefone", user.phone],
                ["Email", user.email || "—"],
                ["Cidade/Estado", [user.city, user.state].filter(Boolean).join(" - ") || "—"],
                ["Nº de Inscrição", `#${String(user.inscription_number || 0).padStart(4, "0")}`],
                ["Data de Cadastro", regText],
                ["Data de Vencimento", expText],
                ["Status", user.status],
              ].map(([label, value]) => (
                <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "7px 0", fontSize: "11px", color: "#888", fontWeight: "600", width: "140px" }}>{label}</td>
                  <td style={{ padding: "7px 0", fontSize: "12px", color: "#1a1a2e", fontWeight: "500" }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QR Code */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "130px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: "#D4A853" }}>
            QR Code
          </div>
          <div style={{ padding: "10px", background: "#fff", border: "2px solid #f0f0f0", borderRadius: "10px" }}>
            <QRCodeSVG
              value={qrData}
              size={110}
              fgColor="#1a1a2e"
              bgColor="#ffffff"
              level="M"
            />
          </div>
          <div style={{ fontSize: "9px", color: "#999", textAlign: "center", maxWidth: "120px" }}>
            Escaneie para verificar autenticidade
          </div>
        </div>
      </div>

      {/* ── Linha de barras decorativa (barcode fake) ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", padding: "16px", background: "#f9f9f9", borderRadius: "10px" }}>
        <div style={{ flex: 1 }}>
          {/* Barcode visual simulado */}
          <div style={{ display: "flex", gap: "2px", alignItems: "stretch", height: "48px" }}>
            {Array.from({ length: 60 }, (_, i) => {
              const seed = (i * 13 + 7) % 17;
              const h = 30 + (seed % 18);
              const w = seed % 3 === 0 ? 3 : seed % 3 === 1 ? 2 : 1;
              return (
                <div
                  key={i}
                  style={{
                    width: `${w}px`,
                    height: `${h}px`,
                    background: "#1a1a2e",
                    alignSelf: "flex-end",
                    borderRadius: "1px",
                  }}
                />
              );
            })}
          </div>
          <div style={{ fontSize: "10px", color: "#888", letterSpacing: "4px", marginTop: "6px", fontFamily: "'Courier New', monospace" }}>
            {user.card_number?.replace(/-/g, " ") || ""}
          </div>
        </div>
        <div style={{ textAlign: "right", minWidth: "100px" }}>
          <div style={{ fontSize: "9px", color: "#bbb", textTransform: "uppercase", letterSpacing: "1px" }}>Insc. Nº</div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#D4A853", letterSpacing: "2px" }}>
            #{String(user.inscription_number || 0).padStart(4, "0")}
          </div>
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "9px", color: "#bbb", maxWidth: "300px" }}>
          Este cartão é de uso pessoal e intransferível. Em caso de dúvidas, entre em contato com {businessName}.
        </div>
        <div style={{ fontSize: "9px", color: "#D4A853", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
          {businessName}
        </div>
      </div>
    </div>
  );
});

CardPrintView.displayName = "CardPrintView";
export default CardPrintView;
