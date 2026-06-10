import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Pencil, Trash2, Percent, Upload } from "lucide-react";
import PhoneInput from "../components/admin/PhoneInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "../components/admin/AdminGuard";
import AdminNav from "../components/admin/AdminNav";

const emptyForm = {
  name: "", category: "", discount_percentage: "", address: "", neighborhood: "",
  city: "", state: "", phone: "", phone2: "", description: "", logo_url: "", active: true,
};

function CompaniesContent() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const queryClient = useQueryClient();

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => base44.entities.Company.list(),
    initialData: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.filter({ active: true }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Company.create({ ...data, discount_percentage: parseFloat(data.discount_percentage) || 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["companies"] }); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, { ...data, discount_percentage: parseFloat(data.discount_percentage) || 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["companies"] }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Company.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  const closeForm = () => { setShowForm(false); setEditing(null); setFormData(emptyForm); };

  const openEdit = (company) => {
    setEditing(company);
    setFormData({
      name: company.name || "", category: company.category || "",
      discount_percentage: company.discount_percentage?.toString() || "",
      address: company.address || "", neighborhood: company.neighborhood || "",
      city: company.city || "", state: company.state || "",
      phone: company.phone || "", phone2: company.phone2 || "",
      description: company.description || "", logo_url: company.logo_url || "",
      active: company.active !== false,
    });
    setShowForm(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData((prev) => ({ ...prev, logo_url: file_url }));
    setUploadingLogo(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editing ? updateMutation.mutate({ id: editing.id, data: formData }) : createMutation.mutate(formData);
  };

  return (
    <div>
      <AdminNav active="AdminCompanies" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-6 h-6 text-[#FF6B00]" />
          Gerenciar Empresas
        </h1>
        <Button onClick={() => setShowForm(true)} className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Nova Empresa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {companies.map((company, index) => (
            <motion.div key={company.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ delay: index * 0.03 }}
              className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-[#FF6B00]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold text-sm">{company.name}</h3>
                    {company.category && <p className="text-xs text-gray-500">{company.category}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-orange-50 text-[#FF6B00] px-2 py-1 rounded-lg">
                  <Percent className="w-3 h-3" />
                  <span className="text-sm font-bold">{company.discount_percentage}</span>
                </div>
              </div>

              {company.description && (
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{company.description}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-orange-100">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  company.active !== false ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                }`}>
                  {company.active !== false ? "Ativa" : "Inativa"}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(company)}
                    className="text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 h-8 w-8">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon"
                    onClick={() => { if (window.confirm(`Excluir ${company.name}?`)) deleteMutation.mutate(company.id); }}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {companies.length === 0 && (
        <div className="text-center py-20 bg-white border border-orange-100 rounded-2xl shadow-sm">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma empresa cadastrada</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="bg-white border-orange-100 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editing ? "Editar Empresa" : "Nova Empresa"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <div>
                <Label htmlFor="company-logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-200 text-sm text-[#FF6B00] hover:bg-orange-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingLogo ? "Enviando..." : "Enviar Logo"}
                  </div>
                </Label>
                <input id="company-logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                {formData.logo_url && (
                  <button type="button" onClick={() => setFormData(p => ({ ...p, logo_url: "" }))}
                    className="text-xs text-red-400 mt-1 hover:underline">Remover logo</button>
                )}
              </div>
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Nome da Empresa *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required className="border-gray-300 text-gray-900 mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Categoria</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="border-gray-300 text-gray-900 mt-1.5">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Desconto (%) *</Label>
                <Input type="number" min="0" max="100" step="0.1" value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  required className="border-gray-300 text-gray-900 mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Endereço</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, complemento" className="border-gray-300 text-gray-900 mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Bairro</Label>
                <Input value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="border-gray-300 text-gray-900 mt-1.5" />
              </div>
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Cidade</Label>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border-gray-300 text-gray-900 mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Estado (UF)</Label>
              <Input value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase().slice(0, 2) })}
                placeholder="SP" maxLength={2} className="border-gray-300 text-gray-900 mt-1.5 uppercase" />
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Telefone Principal</Label>
              <PhoneInput value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })}
                className="border-gray-300 text-gray-900 mt-1.5" />
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Telefone Secundário / Celular</Label>
              <PhoneInput value={formData.phone2} onChange={(val) => setFormData({ ...formData, phone2: val })}
                className="border-gray-300 text-gray-900 mt-1.5" />
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Descrição</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3} className="border-gray-300 text-gray-900 mt-1.5" />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Empresa Ativa</Label>
              <Switch checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={closeForm} className="text-gray-500">Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold">
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editing ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCompanies() {
  return <AdminGuard><CompaniesContent /></AdminGuard>;
}
