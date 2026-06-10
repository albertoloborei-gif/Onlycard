import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
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
    queryFn: () => base44.entities.CardUser.list(),
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
    const expDate = parseISO(user.expiration_date);
    return expDate >= today && expDate <= futureDate;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18); doc.setFont(undefined, "bold");
    doc.text("Relatório de Usuários", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10); doc.setFont(undefined, "normal");
    doc.text(`Data: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);
    doc.text(`Filtro: ${statusFilter === "todos" ? "Todos" : statusFilter}`, 14, 36);
    doc.text(`Previsão: ${futureDays} dias`, 14, 42);
    doc.setFontSize(12); doc.setFont(undefined, "bold");
    doc.text("Estatísticas", 14, 52);
    doc.setFontSize(10); doc.setFont(undefined, "normal");
    doc.text(`Total: ${users.length} | Ativos: ${activeUsers.length} | Inativos: ${inactiveUsers.length}`, 14, 58);
    const tableData = filteredUsers.map((user) => [
      String(user.inscription_number || 0).padStart(4, "0"),
      user.full_name, formatCPF(user.cpf), user.phone,
      user.expiration_date ? format(parseISO(user.expiration_date), "dd/MM/yyyy") : "—",
      user.status,
    ]);
    doc.autoTable({
      startY: 65,
      head: [["Nº", "Nome", "CPF", "Telefone", "Vencimento", "Status"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 107, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [255, 247, 237] },
    });
    if (expiringUsers.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12); doc.setFont(undefined, "bold");
      doc.text(`Vencimentos nos próximos ${futureDays} dias (${expiringUsers.length})`, 14, finalY);
      const expiringData = expiringUsers.map((user) => [
        user.full_name, formatCPF(user.cpf),
        format(parseISO(user.expiration_date), "dd/MM/yyyy"),
        `${Math.ceil((parseISO(user.expiration_date) - new Date()) / (1000 * 60 * 60 * 24))} dias`,
      ]);
      doc.autoTable({
        startY: finalY + 5,
        head: [["Nome", "CPF", "Vencimento", "Prazo"]],
        body: expiringData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42] },
      });
    }
    doc.save(`relatorio-usuarios-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div>
      <AdminNav active="AdminReports" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#FF6B00]" />
            Relatórios de Usuários
          </h1>
          <p className="text-gray-500 text-sm">Acompanhe status e previsões de vencimento</p>
        </div>
        <Button onClick={generatePDF} className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold">
          <Download className="w-4 h-4 mr-2" /> Gerar PDF
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white border-orange-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Cartões Ativos</CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{activeUsers.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Cartões Inativos</CardTitle>
            <Users className="w-4 h-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{inactiveUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white border border-orange-100 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[#FF6B00]" />
          <h2 className="text-gray-900 font-semibold">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-700 text-sm mb-2">Status do Cartão</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Ativo">Ativos</SelectItem>
                <SelectItem value="Inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-700 text-sm mb-2">Previsão de Vencimento (dias)</Label>
            <Input type="number" value={futureDays} onChange={(e) => setFutureDays(e.target.value)}
              className="border-gray-300 text-gray-900" placeholder="Ex: 30" />
          </div>
        </div>
      </div>

      {/* Expiring Alert */}
      {expiringUsers.length > 0 && (
        <Card className="bg-amber-50 border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Vencimentos nos próximos {futureDays} dias ({expiringUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{user.full_name}</p>
                    <p className="text-gray-500 text-xs">{formatCPF(user.cpf)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-600 text-sm font-semibold">{format(parseISO(user.expiration_date), "dd/MM/yyyy")}</p>
                    <p className="text-gray-400 text-xs">
                      {Math.ceil((parseISO(user.expiration_date) - today) / (1000 * 60 * 60 * 24))} dias
                    </p>
                  </div>
                </div>
              ))}
              {expiringUsers.length > 5 && (
                <p className="text-gray-400 text-xs text-center pt-2">+ {expiringUsers.length - 5} usuário(s) adicional(is)</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-100 bg-orange-50/50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Nº</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Nome</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">CPF</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Telefone</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Vencimento</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isExpiring = user.expiration_date && user.status === "Ativo" &&
                  parseISO(user.expiration_date) >= today && parseISO(user.expiration_date) <= futureDate;
                return (
                  <tr key={user.id} className={`border-b border-orange-50 hover:bg-orange-50/50 transition-colors ${isExpiring ? "bg-amber-50/50" : ""}`}>
                    <td className="px-4 py-3 text-sm text-[#FF6B00] font-mono font-semibold">
                      #{String(user.inscription_number || 0).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{formatCPF(user.cpf)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                    <td className="px-4 py-3 text-sm">
                      {user.expiration_date ? (
                        <div>
                          <div className={isExpiring ? "text-amber-600 font-semibold" : "text-gray-700"}>
                            {format(parseISO(user.expiration_date), "dd/MM/yyyy")}
                          </div>
                          {isExpiring && (
                            <div className="text-xs text-amber-500">
                              {Math.ceil((parseISO(user.expiration_date) - today) / (1000 * 60 * 60 * 24))} dias
                            </div>
                          )}
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.status === "Ativo" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                      }`}>{user.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum usuário encontrado com os filtros selecionados</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminReports() {
  return <AdminGuard><ReportsContent /></AdminGuard>;
}
