import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ADMIN_PASSWORD = "admin2026";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      navigate(createPageUrl("AdminDashboard"));
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Área Administrativa</h1>
          <p className="text-gray-500">Acesso restrito — insira a senha de administrador</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Senha de administrador"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`border-gray-300 text-gray-900 placeholder:text-gray-400 h-12 pl-10 pr-10 ${error ? "border-red-400" : ""}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center">
              Senha incorreta. Tente novamente.
            </motion.p>
          )}

          <Button type="submit" className="w-full h-12 bg-[#FF6B00] hover:bg-orange-600 text-white font-semibold text-base">
            Entrar
          </Button>
        </form>
      </motion.div>
    </div>
  );
}