import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Building2, CreditCard, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import AdminGuard from "../components/admin/AdminGuard";
import AdminNav from "../components/admin/AdminNav";

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}

function DashboardContent() {
  const { data: users } = useQuery({
    queryKey: ["cardusers"],
    queryFn: () => base44.entities.CardUser.list(),
    initialData: [],
  });

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => base44.entities.Company.list(),
    initialData: [],
  });

  const activeUsers = users.filter((u) => u.status === "Ativo").length;
  const inactiveUsers = users.filter((u) => u.status === "Inativo").length;

  return (
    <div>
      <AdminNav active="AdminDashboard" />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel Administrativo</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Users} label="Total de Usuários" value={users.length} color="bg-blue-600" delay={0} />
        <StatCard icon={CreditCard} label="Cartões Ativos" value={activeUsers} color="bg-emerald-600" delay={0.1} />
        <StatCard icon={AlertCircle} label="Cartões Inativos" value={inactiveUsers} color="bg-red-500" delay={0.2} />
        <StatCard icon={Building2} label="Empresas Parceiras" value={companies.length} color="bg-[#B8923F]" delay={0.3} />
      </div>

      {/* Recent Users */}
      <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-orange-100">
          <h2 className="text-lg font-semibold text-gray-900">Últimos Cadastros</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-100 bg-orange-50/50">
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Inscrição</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Nome</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Cartão</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {users
                .sort((a, b) => (a.inscription_number || 0) - (b.inscription_number || 0))
                .slice(-5)
                .reverse()
                .map((user) => (
                  <tr key={user.id} className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-[#FF6B00] font-mono font-semibold">
                      #{String(user.inscription_number || 0).padStart(4, "0")}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{user.full_name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 font-mono">{user.card_number || "---"}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.status === "Ativo"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
