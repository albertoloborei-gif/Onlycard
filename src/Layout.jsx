const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CreditCard, Shield, Search, Building2, MessageCircle } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const isAdmin = currentPageName?.startsWith("Admin");
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    db.entities.BusinessInfo.list().then((data) => {
      if (data?.length > 0) setBusiness(data[0]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-orange-100 bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col items-center gap-3">

          {/* Logo central */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">Cartão Desconto</h1>
              <p className="text-[10px] text-orange-500 uppercase tracking-widest">Sistema de Gerenciamento</p>
            </div>
          </Link>

          {/* Navegação centralizada */}
          <nav className="flex items-center gap-2 flex-wrap justify-center">
            <Link
              to="/BuyCard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#FF6B00] text-white hover:bg-orange-600 transition-all shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Comprar</span>
            </Link>
            {business?.phone && (