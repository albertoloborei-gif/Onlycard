const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { FileText, Filter, Calendar, Users, AlertTriangle, Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays, parseISO } from "date-fns";
import AdminGuard from "../components/admin/AdminGuard";
import AdminNav from "../components/admin/AdminNav";

function formatCPF(cpf) {
  if (!cpf) return "—";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
}

function ReportsContent() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [futureDays, setFutureDays] = useState("30");

  const { data: users = [] } = useQuery({
    queryKey: ["cardusers"],
    queryFn: () => db.entities.CardUser.list(),
  });

  const today = new Date();
  const futureDate = addDays(today, parseInt(futureDays) || 30);

  const filteredUsers = users.filter((user) => {
    if (statusFilter === "todos") return true;
    return user.status === statusFilter;
  });

  const activeUsers = users.filter((u) => u.status === "Ativo");
  const inactiveUsers = users.filter((u) => u.status === "Inativo");

  const expiringUsers = users.filter((user) => {
    if (!user.expiration_date || user.status !== "Ativo") return false;