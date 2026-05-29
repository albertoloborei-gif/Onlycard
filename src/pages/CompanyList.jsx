const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Phone, Tag, Percent, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function CompanyList() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => db.entities.Company.filter({ active: true }),
    initialData: [],
  });

  const normalizeText = (text) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm) return true;
    const normalized = normalizeText(searchTerm);
    return (
      normalizeText(company.name || "").includes(normalized) ||
      normalizeText(company.category || "").includes(normalized) ||
      normalizeText(company.description || "").includes(normalized) ||
      normalizeText(company.address || "").includes(normalized)
    );
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#FF6B00] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Empresas Parceiras</h1>
        <p className="text-gray-500">Confira os descontos disponíveis em nossos parceiros</p>
      </motion.div>

      <div className="mb-6 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Pesquisar por nome, categoria, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
              <Skeleton className="h-6 w-40 bg-gray-100 mb-4" />
              <Skeleton className="h-4 w-32 bg-gray-100 mb-2" />
              <Skeleton className="h-4 w-24 bg-gray-100" />
            </div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-20 bg-white border border-orange-100 rounded-2xl shadow-sm">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada ainda"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white border border-orange-100 rounded-2xl p-6 hover:border-orange-300 hover:shadow-md transition-all duration-300 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#FF6B00]" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-gray-900 font-semibold">{company.name}</h3>
                    {company.category && (
                      <Badge className="mt-1 bg-orange-50 text-[#FF6B00] border-orange-200 text-[10px]">
                        <Tag className="w-3 h-3 mr-1" />
                        {company.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#FF6B00] text-white px-3 py-1.5 rounded-full shrink-0">
                  <Percent className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold">{company.discount_percentage}</span>
                </div>
              </div>

              {company.description && (
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{company.description}</p>
              )}

              <div className="space-y-2 pt-3 border-t border-orange-100">
                {(company.address || company.neighborhood || company.city) && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      [company.address, company.neighborhood, company.city, company.state].filter(Boolean).join(", ")
                    )}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#FF6B00] hover:text-orange-600 text-xs transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="underline">
                      {[company.address, company.neighborhood, company.city, company.state].filter(Boolean).join(", ")}
                    </span>
                  </a>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{company.phone}</span>
                    <a href={`https://wa.me/55${company.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="ml-auto">
                      <Button size="icon" className="h-6 w-6 bg-emerald-500 hover:bg-emerald-600 text-white">
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                )}
                {company.phone2 && (
                  <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{company.phone2}</span>
                    <a href={`https://wa.me/55${company.phone2.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="ml-auto">
                      <Button size="icon" className="h-6 w-6 bg-emerald-500 hover:bg-emerald-600 text-white">
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}