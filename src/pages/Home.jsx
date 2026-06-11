const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CreditCard, Search, Building2, Shield, ArrowRight, Percent, Zap } from "lucide-react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, link, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Link
      to={createPageUrl(link)}
      className="group block p-6 rounded-2xl border border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100"
    >
      <div className="w-12 h-12 rounded-xl bg-[#FF6B00] flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{description}</p>
      <div className="flex items-center gap-2 text-[#FF6B00] text-sm font-medium group-hover:gap-3 transition-all">
        Acessar <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  </motion.div>
);

const benefits = [
  { icon: Percent, title: "Descontos Exclusivos", desc: "Em diversas Categorias" },
  { icon: Building2, title: "Rede de Parceiros", desc: "Centenas de estabelecimentos" },
  { icon: Shield, title: "Garantia", desc: "Validade de 1 ano" },
  { icon: Zap, title: "Uso Imediato", desc: "Ative e use na hora" }
];

export default function Home() {
  const [business, setBusiness] = useState(null);

 useEffect(() => {
  const load = async () => {
    try {
      const data = await db.entities.BusinessInfo.filter();
      if (data?.length > 0) {
        setBusiness(data[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  load();
}, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        {/* Logo e nome da empresa */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {business?.logo_url ? (
            <img src={business.logo_url} alt={business.business_name} className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-orange-100" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-[#FF6B00] flex items-center justify-center shadow-lg shadow-orange-200">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          {business?.business_name ? (
            <span className="text-[#FF6B00]">{business.business_name}</span>
          ) : (
            <>Cartão <span className="text-[#FF6B00]">Desconto</span></>
          )}
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Gerencie seus cartões de desconto, empresas parceiras e aproveite benefícios exclusivos.
        </p>
      </motion.div>

      {/* Benefícios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-12">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-white border border-orange-100 rounded-xl p-5 text-center shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-3">
              <benefit.icon className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{benefit.title}</h3>
            <p className="text-xs text-gray-500">{benefit.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <FeatureCard
          icon={Search}
          title="Consultar Cartão"
          description="Consulte seus dados, número do cartão e vencimento usando seu CPF."
          link="UserPortal"
          delay={0.1}
        />
        <FeatureCard
          icon={Building2}
          title="Empresas Parceiras"
          description="Veja todas as empresas cadastradas e os descontos disponíveis."
          link="CompanyList"
          delay={0.2}
        />
        <FeatureCard
          icon={Shield}
          title="Área Administrativa"
          description="Acesse o painel administrativo para gerenciar o sistema."
          link="AdminLogin"
          delay={0.3}
        />
      </div>
    </div>
  );
}
