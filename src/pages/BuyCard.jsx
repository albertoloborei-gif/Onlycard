const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Check, Shield, Building2, Percent, Zap, Info, X } from "lucide-react";

import { toast } from "sonner";
import PaymentModal from "../components/PaymentModal";
import CPFInput from "../components/admin/CPFInput";
import PhoneInput from "../components/admin/PhoneInput";

export default function BuyCard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "", cpf: "", phone: "", email: "", city: "", state: ""
  });
  const [cardUserId, setCardUserId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardPrice, setCardPrice] = useState(50);
  const [saibaMaisContent, setSaibaMaisContent] = useState("");
  const [showSaibaMais, setShowSaibaMais] = useState(false);

  useEffect(() => {
    db.entities.BusinessInfo.filter().then((data) => {
      if (data?.length > 0) {
        if (data[0].card_price) setCardPrice(data[0].card_price);
        if (data[0].saiba_mais_content) setSaibaMaisContent(data[0].saiba_mais_content);
      }
    });
  }, []);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmitData = async () => {
    if (!formData.full_name.trim()) { toast.error("Preencha o Nome Completo"); return; }
    const cpfNums = formData.cpf.replace(/\D/g, "");
    if (cpfNums.length !== 11) { toast.error("Preencha um CPF válido (11 dígitos)"); return; }
    if (!formData.phone.trim()) { toast.error("Preencha o Telefone"); return; }

    setLoading(true);
    try {
      const existing = await db.entities.CardUser.list();
      const cpfDuplicate = existing.find(u => u.cpf && u.cpf.replace(/\D/g, "") === cpfNums);
      if (cpfDuplicate) { toast.error("CPF já cadastrado no sistema"); setLoading(false); return; }

      const cardUser = await db.entities.CardUser.create({
        full_name: formData.full_name, cpf: formData.cpf, phone: formData.phone,
        email: formData.email, city: formData.city,
        state: formData.state?.toUpperCase(), status: "Inativo"
      });
      setCardUserId(cardUser.id);
      setShowPayment(true);
    } catch (error) {
      toast.error("Erro ao processar cadastro");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Percent, title: "Descontos Exclusivos", desc: "Em diversas Categorias" },
    { icon: Building2, title: "Rede de Parceiros", desc: "Centenas de estabelecimentos" },
    { icon: Shield, title: "Garantia", desc: "Validade de 1 ano" },
    { icon: Zap, title: "Uso Imediato", desc: "Ative e use na hora" }
  ];

  return (
    <div className="min-h-screen py-12">
      {/* Modal Saiba Mais */}
      {showSaibaMais && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-orange-100 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Saiba Mais</h2>
              <button onClick={() => setShowSaibaMais(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {saibaMaisContent || "Nenhuma informação disponível no momento."}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Adquira seu OnlyCard</h1>
          </div>
          <p className="text-gray-500 text-lg">Cartão de descontos com validade de 1 ano</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="bg-white border border-orange-100 rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-500">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {saibaMaisContent && (
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => setShowSaibaMais(true)}
              className="border-orange-200 text-[#FF6B00] hover:bg-orange-50 gap-2">
              <Info className="w-4 h-4" />
              Saiba Mais
            </Button>
          </div>
        )}

        <div className="bg-white border border-orange-100 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step >= 1 ? 'bg-[#FF6B00]' : 'bg-gray-200'}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : <span className="text-sm">1</span>}
              </div>
              <span className={step >= 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}>Dados</span>
            </div>
            <div className="flex-1 h-0.5 bg-orange-100 mx-4" />
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[#FF6B00] text-white' : 'bg-gray-100 text-gray-400'}`}>
                <span className="text-sm">2</span>
              </div>
              <span className={step >= 2 ? 'text-gray-900 font-medium' : 'text-gray-400'}>Pagamento</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Nome Completo *", field: "full_name", type: "text" },
                  { label: "Email", field: "email", type: "email" },
                  { label: "Cidade", field: "city", type: "text" },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                    <Input value={formData[field]} type={type}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="border-gray-300 text-gray-900" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                  <CPFInput value={formData.cpf} onChange={(v) => handleInputChange("cpf", v)} className="border-gray-300 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                  <PhoneInput value={formData.phone} onChange={(v) => handleInputChange("phone", v)} className="border-gray-300 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado (UF)</label>
                  <Input value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value.slice(0, 2).toUpperCase())}
                    maxLength={2} placeholder="SP" className="border-gray-300 text-gray-900 uppercase" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">OnlyCard - 1 Ano</h3>
                    <p className="text-sm text-gray-500">Validade: 12 meses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#FF6B00]">R$ {cardPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Pagamento único</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Ao efetivar a compra, você concorda com os{" "}
                <span className="text-[#FF6B00] underline cursor-pointer" onClick={() => setShowSaibaMais(true)}>Termos de Uso</span>.
              </p>

              <Button onClick={handleSubmitData} disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold h-12">
                {loading ? "Processando..." : "Continuar para Pagamento"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentModal open={showPayment}
          onClose={() => { setShowPayment(false); window.location.reload(); }}
          cardUserId={cardUserId} valor={cardPrice} cpf={formData.cpf} fullName={formData.full_name} />
      )}
    </div>
  );
}
