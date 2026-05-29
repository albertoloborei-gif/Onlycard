const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

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
    queryFn: () => db.entities.Category.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Category.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["categories"]); toast.success("Categoria criada com sucesso"); resetForm(); },
    onError: () => toast.error("Erro ao criar categoria"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Category.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["categories"]); toast.success("Categoria atualizada com sucesso"); resetForm(); },
    onError: () => toast.error("Erro ao atualizar categoria"),
  });

  const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm) return true;
    const normalized = normalizeText(searchTerm);