import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Tag } from "lucide-react";
import AdminGuard from "../components/admin/AdminGuard";
import AdminNav from "../components/admin/AdminNav";
import { toast } from "sonner";

function CategoriesContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", active: true });
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["categories"]); toast.success("Categoria criada com sucesso"); resetForm(); },
    onError: () => toast.error("Erro ao criar categoria"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["categories"]); toast.success("Categoria atualizada com sucesso"); resetForm(); },
    onError: () => toast.error("Erro ao atualizar categoria"),
  });

  const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm) return true;
    const normalized = normalizeText(searchTerm);
    return normalizeText(cat.name).includes(normalized) || normalizeText(cat.description || "").includes(normalized);
  });

  const resetForm = () => { setFormData({ name: "", description: "", active: true }); setEditingCategory(null); setDialogOpen(false); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const duplicate = categories.find(
      (cat) => normalizeText(cat.name) === normalizeText(formData.name) && cat.id !== editingCategory?.id
    );
    if (duplicate) { toast.error("Já existe uma categoria com este nome"); return; }
    editingCategory
      ? updateMutation.mutate({ id: editingCategory.id, data: formData })
      : createMutation.mutate(formData);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "", active: category.active });
    setDialogOpen(true);
  };

  return (
    <div>
      <AdminNav active="AdminCategories" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorias</h1>
          <p className="text-gray-500 text-sm">Gerencie as categorias das empresas parceiras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-[#FF6B00] hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-orange-100">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-700">Nome da Categoria *</Label>
                <Input required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-gray-300 text-gray-900"
                  placeholder="Ex: Alimentação, Saúde, Educação..." />
              </div>
              <div>
                <Label className="text-gray-700">Descrição</Label>
                <Textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-gray-300 text-gray-900" placeholder="Descreva a categoria..." />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} />
                <Label className="text-gray-700">Categoria ativa</Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit" className="bg-[#FF6B00] hover:bg-orange-600 text-white">
                  {editingCategory ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Pesquisar categorias..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 text-gray-900 placeholder:text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-12">Carregando...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="bg-white border-orange-100 hover:border-orange-300 hover:shadow-md transition-all shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 text-base">{category.name}</CardTitle>
                </div>
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(category)}
                  className="text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50">
                  <Pencil className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {category.description && <p className="text-gray-500 text-sm mb-3">{category.description}</p>}
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    category.active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {category.active ? "Ativa" : "Inativa"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCategories() {
  return <AdminGuard><CategoriesContent /></AdminGuard>;
}
