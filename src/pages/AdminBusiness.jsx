const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";

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
    queryFn: () => db.entities.BusinessInfo.list(),
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