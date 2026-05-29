const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import { Search, CreditCard, User, Phone, Calendar, CheckCircle, XCircle, Printer, AlertCircle, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import CardPrintView from "../components/CardPrintView";

function formatCPF(value) {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

export default function UserPortal() {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const printRef = useRef(null);

  const { data: businessList } = useQuery({
    queryKey: ["businessinfo"],
    queryFn: () => db.entities.BusinessInfo.list(),
    initialData: [],
  });
  const business = businessList.length > 0 ? businessList[0] : null;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Cartao_Desconto_${result?.full_name || ""}`,
  });

  const handleSearch = async () => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const users = await db.entities.CardUser.filter({ cpf: cleanCpf });
      if (users.length > 0) {
        const user = users[0];
        if (user.expiration_date) {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const expDate = new Date(user.expiration_date); expDate.setHours(0, 0, 0, 0);
          if (expDate >= today && user.status === "Inativo") {
            await db.entities.CardUser.update(user.id, { status: "Ativo" }); user.status = "Ativo";
          } else if (expDate < today && user.status === "Ativo") {
            await db.entities.CardUser.update(user.id, { status: "Inativo" }); user.status = "Inativo";
          }
        }
        setResult(user);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#FF6B00] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultar Cartão</h1>
        <p className="text-gray-500">Digite seu CPF para consultar seus dados</p>
      </motion.div>

      <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
        <div className="flex gap-3">
          <Input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 text-lg tracking-wider"
          />
          <Button
            onClick={handleSearch}
            disabled={loading || cpf.replace(/\D/g, "").length !== 11}
            className="h-12 px-6 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="mt-8 space-y-6">
            {/* Card Visual */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700 p-6 shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF6B00]/10 rounded-full -translate-y-10 translate-x-10" />
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs uppercase tracking-widest text-[#FF6B00] font-semibold">Cartão Desconto</span>
              </div>
              <p className="text-2xl sm:text-3xl font-mono text-white tracking-[0.2em] mb-6">{result.card_number || "---"}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Titular</p>
                  <p className="text-white font-semibold">{result.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Validade</p>
                  <p className="text-white font-semibold">
                    {result.expiration_date ? format(new Date(result.expiration_date), "MM/yyyy") : "---"}
                  </p>
                  {(result.city || result.state) && (
                    <p className="text-[9px] text-[#FF6B00] mt-1">{[result.city, result.state].filter(Boolean).join(" - ")}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {result.status === "Ativo" ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> Ativo
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-100 px-3 py-1 rounded-full">
                    <XCircle className="w-3.5 h-3.5" /> Inativo
                  </span>
                )}
              </div>
            </div>

            {/* Status Actions */}
            {result.status === "Inativo" ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-red-600 font-bold text-lg mb-2">Cartão Vencido</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Seu cartão venceu em{" "}
                      <span className="font-semibold text-red-500">
                        {result.expiration_date ? format(new Date(result.expiration_date), "dd/MM/yyyy") : "—"}
                      </span>. Para renovar, entre em contato com o administrador.
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                      <p className="text-gray-500 text-xs uppercase tracking-wider">Contato do Administrador</p>
                      {business?.phone && (
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#FF6B00]" />{business.phone}
                        </p>
                      )}
                      {business?.email && (
                        <p className="text-gray-900 font-medium flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#FF6B00]" />{business.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button onClick={handlePrint}
                  className="w-full h-12 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir / Baixar PDF
                </Button>
                <Link to={createPageUrl("CompanyList")}>
                  <Button className="w-full h-12 bg-orange-50 text-[#FF6B00] border border-orange-200 hover:bg-orange-100 transition-all">
                    <Building2 className="w-4 h-4 mr-2" />
                    Ver Empresas Parceiras
                  </Button>
                </Link>
              </>
            )}

            {/* User Details */}
            <div className="bg-white border border-orange-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-4">Dados do Titular</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: User, label: "Nome", value: result.full_name },
                  { icon: Phone, label: "Telefone", value: result.phone },
                  { icon: Calendar, label: "Cadastro", value: result.registration_date ? format(new Date(result.registration_date), "dd/MM/yyyy") : "---" },
                  { icon: Calendar, label: "Vencimento", value: result.expiration_date ? format(new Date(result.expiration_date), "dd/MM/yyyy") : "---" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
                      <p className="text-gray-900 text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {notFound && (
          <motion.div key="notfound" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-8 text-center py-12 bg-white border border-orange-100 rounded-2xl shadow-sm">
            <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">CPF não encontrado</p>
            <p className="text-gray-400 text-sm mt-1">Verifique o número e tente novamente</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <CardPrintView ref={printRef} user={result} business={business} />
        </div>
      )}
    </div>
  );
}