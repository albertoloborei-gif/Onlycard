import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Pencil, Trash2, Search, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "../components/admin/AdminGuard";
import AdminNav from "../components/admin/AdminNav";
import { generateCardNumber, getNextInscriptionNumber } from "../components/admin/CardNumberGenerator";
import NameInput from "../components/admin/NameInput";
import CPFInput, { formatCPF } from "../components/admin/CPFInput";
import PhoneInput from "../components/admin/PhoneInput";

function UsersContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historyUserId, setHistoryUserId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    cpf: "",
    phone: "",
    email: "",
    neighborhood: "",
    city: "",
    state: "",
    registration_date: new Date().toISOString().split("T")[0],
    expiration_date: "",
    status: "Ativo",
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["cardusers"],
    queryFn: async () => {
      const allUsers = await base44.entities.CardUser.list();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Atualizar status automaticamente baseado na data de vencimento
      const updatePromises = allUsers.map(async (user) => {
        if (user.expiration_date) {
          const expDate = new Date(user.expiration_date);
          expDate.setHours(0, 0, 0, 0);
          
          // Cartão válido se vencimento >= hoje
          if (expDate >= today && user.status === "Inativo") {
            await base44.entities.CardUser.update(user.id, { status: "Ativo" });
            user.status = "Ativo";
          } else if (expDate < today && user.status === "Ativo") {
            await base44.entities.CardUser.update(user.id, { status: "Inativo" });
            user.status = "Inativo";
          }
        }
      });
      
      await Promise.all(updatePromises);
      return allUsers;
    },
    initialData: [],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: renewals = [] } = useQuery({
    queryKey: ["renewals", historyUserId],
    queryFn: () => base44.entities.CardRenewal.filter({ card_user_id: historyUserId }, "-renewal_date"),
    enabled: !!historyUserId,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const cleanCpf = data.cpf.replace(/\D/g, "");
      const nextNum = await getNextInscriptionNumber(base44);
      const cardNumber = generateCardNumber(cleanCpf, data.registration_date, data.expiration_date, nextNum);
      
      const newUser = await base44.entities.CardUser.create({
        ...data,
        cpf: cleanCpf,
        card_number: cardNumber,
        inscription_number: nextNum,
      });

      // Registrar primeiro vencimento no histórico
      if (data.expiration_date) {
        await base44.entities.CardRenewal.create({
          card_user_id: newUser.id,
          expiration_date: data.expiration_date,
          renewal_date: data.registration_date || new Date().toISOString().split("T")[0],
          notes: "Cadastro inicial",
        });
      }

      return newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardusers"] });
      queryClient.invalidateQueries({ queryKey: ["renewals"] });
      closeForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const cleanCpf = data.cpf.replace(/\D/g, "");
      const cardNumber = editingUser.inscription_number
        ? generateCardNumber(cleanCpf, data.registration_date, data.expiration_date, editingUser.inscription_number)
        : editingUser.card_number;

      // Se a data de vencimento mudou, registrar no histórico
      if (data.expiration_date && data.expiration_date !== editingUser.expiration_date) {
        await base44.entities.CardRenewal.create({
          card_user_id: id,
          expiration_date: data.expiration_date,
          renewal_date: new Date().toISOString().split("T")[0],
          notes: data.status === "Ativo" ? "Renovação" : "Atualização de vencimento",
        });
      }

      return base44.entities.CardUser.update(id, {
        ...data,
        cpf: cleanCpf,
        card_number: cardNumber,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cardusers"] });
      queryClient.invalidateQueries({ queryKey: ["renewals"] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CardUser.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cardusers"] }),
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      full_name: "",
      cpf: "",
      phone: "",
      email: "",
      neighborhood: "",
      city: "",
      state: "",
      registration_date: new Date().toISOString().split("T")[0],
      expiration_date: "",
      status: "Ativo",
    });
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      cpf: formatCPF(user.cpf || ""),
      phone: user.phone || "",
      email: user.email || "",
      neighborhood: user.neighborhood || "",
      city: user.city || "",
      state: user.state || "",
      registration_date: user.registration_date || "",
      expiration_date: user.expiration_date || "",
      status: user.status || "Ativo",
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const sortedUsers = [...users]
    .sort((a, b) => (a.inscription_number || 0) - (b.inscription_number || 0));

  const filteredUsers = sortedUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(term) ||
      (u.cpf || "").includes(searchTerm.replace(/\D/g, "")) ||
      (u.card_number || "").includes(term)
    );
  });

  return (
    <div>
      <AdminNav active="AdminUsers" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-6 h-6 text-[#FF6B00]" />
          Gerenciar Usuários
        </h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Buscar por nome, CPF ou cartão..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-gray-300 text-gray-900 placeholder:text-gray-400 pl-10 h-11"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-100 bg-orange-50/50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Nº</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Nome</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">CPF</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Telefone</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Cartão</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-[#FF6B00] font-mono font-semibold">
                      #{String(user.inscription_number || 0).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{formatCPF(user.cpf || "")}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{user.card_number || "---"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.status === "Ativo"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setHistoryUserId(user.id);
                            setShowHistory(true);
                          }}
                          className="text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 h-8 w-8"
                          title="Histórico de renovações"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(user)}
                          className="text-slate-400 hover:text-[#D4A853] hover:bg-[#D4A853]/10 h-8 w-8"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`Excluir ${user.full_name}?`)) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="bg-white border-orange-100 text-gray-900 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Nome Completo *</Label>
              <NameInput
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="border-gray-300 text-gray-900 mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">CPF *</Label>
                <CPFInput
                  value={formData.cpf}
                  onChange={(val) => setFormData({ ...formData, cpf: val })}
                  required
                  className="border-gray-300 text-gray-900 mt-1.5"
                />
              </div>
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Telefone *</Label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                  required
                  className="border-gray-300 text-gray-900 mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800/60 border-slate-700 text-white mt-1.5"
              />
            </div>

            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Bairro</Label>
              <Input
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="bg-slate-800/60 border-slate-700 text-white mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-slate-800/60 border-slate-700 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Estado (UF)</Label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })}
                  placeholder="SP"
                  maxLength={2}
                  className="bg-slate-800/60 border-slate-700 text-white mt-1.5 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Data Cadastro</Label>
                <Input
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                  className="bg-slate-800/60 border-slate-700 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-xs uppercase tracking-wider">Data Vencimento</Label>
                <Input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  className="bg-slate-800/60 border-slate-700 text-white mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300 text-xs uppercase tracking-wider">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-slate-800/60 border-slate-700 text-white mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={closeForm} className="text-slate-400">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-[#D4A853] to-[#B8923F] text-slate-950 font-semibold"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : editingUser ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={(open) => {
        if (!open) {
          setShowHistory(false);
          setHistoryUserId(null);
        }
      }}>
        <DialogContent className="bg-white border-orange-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-[#FF6B00]" />
              Histórico de Renovações
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {renewals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma renovação registrada</p>
            ) : (
              <div className="space-y-3">
                {renewals.map((renewal, index) => (
                  <div key={renewal.id} className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        {index === 0 && <span className="text-emerald-600 font-semibold mr-2">● ATUAL</span>}
                        Renovação #{renewals.length - index}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(renewal.renewal_date), "dd/MM/yyyy")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      Vencimento: {format(new Date(renewal.expiration_date), "dd/MM/yyyy")}
                    </div>
                    {renewal.notes && (
                      <p className="text-xs text-gray-500 mt-1">{renewal.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}
