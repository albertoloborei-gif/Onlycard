import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Building2, Briefcase, LayoutDashboard, LogOut, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNav({ active }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    navigate(createPageUrl("Home"));
  };

  const links = [
    { name: "Dashboard", page: "AdminDashboard", icon: LayoutDashboard },
    { name: "Usuários", page: "AdminUsers", icon: Users },
    { name: "Empresas", page: "AdminCompanies", icon: Building2 },
    { name: "Categorias", page: "AdminCategories", icon: Tag },
    { name: "Relatórios", page: "AdminReports", icon: FileText },
    { name: "Minha Empresa", page: "AdminBusiness", icon: Briefcase },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-8 pb-6 border-b border-orange-100">
      <div className="flex flex-wrap gap-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = active === link.page;
          return (
            <Link
              key={link.page}
              to={createPageUrl(link.page)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#FF6B00] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-orange-50 border border-transparent hover:border-orange-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </div>
      <Button variant="ghost" onClick={handleLogout} className="text-gray-400 hover:text-red-500 hover:bg-red-50">
        <LogOut className="w-4 h-4 mr-2" />
        Sair
      </Button>
    </div>
  );
}