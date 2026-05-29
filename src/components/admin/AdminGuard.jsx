import React from "react";
import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminGuard({ children }) {
  const isAuth = sessionStorage.getItem("admin_auth") === "true";
  
  if (!isAuth) {
    return <Navigate to={createPageUrl("AdminLogin")} replace />;
  }

  return children;
}