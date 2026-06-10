import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Save, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import AdminGuard from "../components/admin/AdminGuard";
import AdminNav from "../components/admin/AdminNav";

function BusinessContent() {
  const queryClient = useQueryClient();

  const { data: businessList } = useQuery({
    queryKey: ["businessinfo"],
    queryFn: () => base44.entities.BusinessInfo.list(),
    initialData: [],
  });

  const existing = businessList.length > 0 ? businessList[0] : null;

  const [formData, setFormData] = useState({
    business_name: "", cnpj: "", address: "", phone: "", email: "",
    logo_url: "", description: "", card_price: 50, saiba_mais_content: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingSaibaMais, setUploadingSaibaMais] = useState(false);

  useEffect(() => {
    if (existing) {
      setFormData({
        business_name: existing.business_name || "",
        cnpj: existing.cnpj || "",
        address: existing.address || "",
        phone: existing.phone || "",
        email: existing.email || "",
        logo_url: existing.logo_url || "",
        description: existing.description || "",
        card_price: existing.card_price ?? 50,
        saiba_mais_content: existing.saiba_mais_content || "",
      });
    }
  }, [existing]);

  const handleSaibaMaisUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSaibaMais(true);
    const text = await file.text();
    setFormData((prev) => ({ ...prev, saiba_mais_content: text }));
    setUploadingSaibaMais(false);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => existing
      ? base44.entities.BusinessInfo.update(existing.id, data)
      : base44.entities.BusinessInfo.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["businessinfo"] }),
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData((prev) => ({ ...prev, logo_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => { e.preventDefault(); saveMutation.mutate(formData); };

  return (
    <div>
      <AdminNav active="AdminBusiness" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
          <Briefcase className="w-6 h-6 text-[#FF6B00]" />
          Minha Empresa
        </h1>

        <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Briefcase className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-200 text-sm text-[#FF6B00] hover:bg-orange-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Enviando..." : "Enviar Logo"}
                  </div>
                </Label>
                <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Nome da Empresa *</Label>
                <Input value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  required className="border-gray-300 text-gray-900 mt-1.5" />
              </div>
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">CNPJ</Label>
                <Input value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="border-gray-300 text-gray-900 mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Endereço</Label>
              <Input value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-gray-300 text-gray-900 mt-1.5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Telefone</Label>
                <Input value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-300 text-gray-900 mt-1.5" />
              </div>
              <div>
                <Label className="text-gray-700 text-xs uppercase tracking-wider">Email</Label>
                <Input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-300 text-gray-900 mt-1.5" />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Descrição</Label>
              <Textarea value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4} className="border-gray-300 text-gray-900 mt-1.5" />
            </div>

            <div className="border-t border-orange-100 pt-4">
              <Label className="text-gray-700 text-xs uppercase tracking-wider">Valor do Cartão (R$)</Label>
              <Input type="number" min="0" step="0.01" value={formData.card_price}
                onChange={(e) => setFormData({ ...formData, card_price: parseFloat(e.target.value) || 0 })}
                className="border-gray-300 text-gray-900 mt-1.5 max-w-xs" />
              <p className="text-gray-400 text-xs mt-1">Este valor será exibido na tela de compra do cartão.</p>
            </div>

            <div className="border-t border-orange-100 pt-4">
              <Label className="text-gray-700 text-xs uppercase tracking-wider mb-2 block">Conteúdo "Saiba Mais"</Label>
              <div className="flex items-center gap-3 mb-3">
                <Label htmlFor="saiba-mais-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-200 text-sm text-[#FF6B00] hover:bg-orange-50 transition-colors">
                    <FileText className="w-4 h-4" />
                    {uploadingSaibaMais ? "Carregando..." : "Enviar arquivo de texto (.txt)"}
                  </div>
                </Label>
                <input id="saiba-mais-upload" type="file" accept=".txt,text/plain" onChange={handleSaibaMaisUpload} className="hidden" />
                {formData.saiba_mais_content && (
                  <span className="text-emerald-600 text-xs">{formData.saiba_mais_content.length} caracteres carregados</span>
                )}
              </div>
              <Textarea value={formData.saiba_mais_content}
                onChange={(e) => setFormData({ ...formData, saiba_mais_content: e.target.value })}
                rows={5} placeholder="Ou digite o conteúdo diretamente aqui..."
                className="border-gray-300 text-gray-900" />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saveMutation.isPending}
                className="bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold px-8">
                {saveMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>

            {saveMutation.isSuccess && (
              <p className="text-emerald-600 text-sm text-center">Dados salvos com sucesso!</p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminBusiness() {
  return <AdminGuard><BusinessContent /></AdminGuard>;
}
