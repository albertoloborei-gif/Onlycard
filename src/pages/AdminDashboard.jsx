const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

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
    queryFn: () => db.entities.CardUser.list(),
    initialData: [],
  });

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => db.entities.Company.list(),
    initialData: [],
  });

  const activeUsers = users.filter((u) => u.status === "Ativo").length;
  const inactiveUsers = users.filter((u) => u.status === "Inativo").length;

  return (