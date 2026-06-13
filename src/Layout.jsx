import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CreditCard, Shield, Search, Building2, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const isAdmin = currentPageName?.startsWith("Admin");
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    base44.entities.BusinessInfo.filter().then((data) => {
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
              <a
                href={`https://wa.me/55${business.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#FF6B00] text-white hover:bg-orange-600 transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Fale Conosco</span>
              </a>
            )}
            <Link
              to={createPageUrl("UserPortal")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#FF6B00] text-white hover:bg-orange-600 transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Consultar Cartão</span>
            </Link>
            <Link
              to={createPageUrl("CompanyList")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#FF6B00] text-white hover:bg-orange-600 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Empresas</span>
            </Link>
            <Link
              to={createPageUrl("AdminLogin")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#FF6B00] text-white hover:bg-orange-600 transition-all shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100 mt-12 py-6">
        <p className="text-center text-xs text-gray-400">
          © 2026 Cartão Desconto — Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
