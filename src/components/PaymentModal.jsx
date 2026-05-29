const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Copy, ExternalLink } from "lucide-react";

import { toast } from "sonner";
import { generateCardNumber, getNextInscriptionNumber } from "@/components/admin/CardNumberGenerator";

const isSandbox = import.meta.env.VITE_ASAAS_SANDBOX_MODE !== "false";
const BASE_URL = isSandbox
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3";
const API_KEY = import.meta.env.VITE_ASAAS_API_KEY;

async function asaas(path, method = "GET", body = null) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "access_token": API_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.description || `Erro Asaas ${res.status}`);
  return data;
}

export default function PaymentModal({ open, onClose, cardUserId, valor = 50, cpf }) {
  const [step, setStep] = useState("loading"); // loading | pix | confirmed | error
  const [pixData, setPixData] = useState(null);
  const [paymentRecordId, setPaymentRecordId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const intervalRef = useRef(null);
  const asaasPaymentIdRef = useRef(null);

  const init = async () => {
    setStep("loading");
    setErrorMsg("");
    try {
      if (!API_KEY) throw new Error("Chave API do Asaas não configurada. Configure VITE_ASAAS_API_KEY.");

      // 1. Criar cobrança PIX
      const payment = await asaas("/payments", "POST", {
        billingType: "PIX",
        value: valor,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: "OnlyCard - Cartão de Descontos",
        // customer é opcional no sandbox sem externalReference
      });

      asaasPaymentIdRef.current = payment.id;

      // 2. Buscar QR Code PIX
      const pix = await asaas(`/payments/${payment.id}/pixQrCode`);

      // 3. Salvar no banco
      const record = await db.entities.Payment.create({
        card_user_id: cardUserId,
        valor,
        status: "pendente",
        asaas_payment_id: payment.id,
        billing_type: "PIX",
        descricao: "OnlyCard - Cartão de Descontos",
        pix_qrcode: pix.encodedImage || "",
        pix_copiaecola: pix.payload || "",
        invoice_url: payment.invoiceUrl || "",
      });

      setPaymentRecordId(record.id);
      setPixData({ qrcode: pix.encodedImage, copiaecola: pix.payload, invoiceUrl: payment.invoiceUrl });
      setStep("pix");

      // 4. Polling de status
      startPolling(payment.id, record.id);
    } catch (err) {
      setErrorMsg(err.message);
      setStep("error");
    }
  };

  const startPolling = (asaasId, recordId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const data = await asaas(`/payments/${asaasId}`);
        if (data.status === "RECEIVED" || data.status === "CONFIRMED") {
          clearInterval(intervalRef.current);
          await activateCard(recordId);
        }
      } catch (_) {}
    }, 6000);
    setTimeout(() => clearInterval(intervalRef.current), 30 * 60 * 1000);
  };

  const activateCard = async (recordId) => {
    try {
      const now = new Date();
      const exp = new Date(now);
      exp.setFullYear(exp.getFullYear() + 1);
      const regStr = now.toISOString().split("T")[0];
      const expStr = exp.toISOString().split("T")[0];

      const inscriptionNumber = await getNextInscriptionNumber(base44);
      const cardNumber = generateCardNumber(cpf || "00000000000", regStr, expStr, inscriptionNumber);

      await Promise.all([
        db.entities.Payment.update(recordId, { status: "pago", data_pagamento: now.toISOString() }),
        db.entities.CardUser.update(cardUserId, {
          status: "Ativo",
          registration_date: regStr,
          expiration_date: expStr,
          card_number: cardNumber,
          inscription_number: inscriptionNumber,
        }),
      ]);

      setStep("confirmed");
      toast.success("Pagamento confirmado! Seu OnlyCard está ativo.");
    } catch (err) {
      setStep("error");
      setErrorMsg("Pagamento recebido, mas erro ao ativar cartão. Contate o suporte.");
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  useEffect(() => {
    if (open) init();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            Pagamento OnlyCard
            {isSandbox && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-normal">SANDBOX</span>}
          </DialogTitle>
        </DialogHeader>

        {/* LOADING */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#D4A853]" />
            <p className="text-slate-400">Gerando cobrança PIX...</p>
          </div>
        )}

        {/* PIX */}
        {step === "pix" && pixData && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Valor</p>
              <p className="text-3xl font-bold text-[#D4A853]">R$ {valor.toFixed(2)}</p>
            </div>

            {pixData.qrcode && (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-xl">
                  <img src={`data:image/png;base64,${pixData.qrcode}`} alt="QR Code PIX" className="w-44 h-44" />
                </div>
                <p className="text-slate-400 text-xs text-center">Escaneie com o app do seu banco</p>
              </div>
            )}

            {pixData.copiaecola && (
              <div>
                <p className="text-slate-400 text-xs mb-1">Pix Copia e Cola:</p>
                <div className="flex gap-2">
                  <input readOnly value={pixData.copiaecola}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white min-w-0" />
                  <Button variant="outline" size="icon" className="border-slate-700 shrink-0"
                    onClick={() => copyText(pixData.copiaecola)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {pixData.invoiceUrl && (
              <a href={pixData.invoiceUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-[#D4A853] underline">
                <ExternalLink className="w-3 h-3" /> Ver fatura completa
              </a>
            )}

            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs py-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Aguardando confirmação automática do pagamento...
            </div>
          </div>
        )}

        {/* CONFIRMADO */}
        {step === "confirmed" && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Pagamento Confirmado!</h3>
              <p className="text-slate-400 text-sm">Seu OnlyCard foi ativado automaticamente.</p>
              <p className="text-slate-400 text-sm">Consulte seus dados na seção "Consultar".</p>
            </div>
            <Button onClick={onClose} className="bg-gradient-to-r from-[#D4A853] to-[#B8923F] text-slate-950 font-semibold">
              Fechar
            </Button>
          </div>
        )}

        {/* ERRO */}
        {step === "error" && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <p className="text-red-400 text-sm">{errorMsg}</p>
            <div className="flex gap-2">
              <Button onClick={init} variant="outline" className="border-slate-700">
                Tentar novamente
              </Button>
              <Button onClick={onClose} variant="ghost" className="text-slate-400">
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}