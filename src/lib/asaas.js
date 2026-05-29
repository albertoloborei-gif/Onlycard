// Configuração centralizada da API do Asaas
const isSandbox = import.meta.env.VITE_ASAAS_SANDBOX_MODE !== "false";

export const ASAAS_BASE_URL = isSandbox
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3";

export const getAsaasHeaders = () => {
  const apiKey = import.meta.env.VITE_ASAAS_API_KEY;
  if (!apiKey) throw new Error("Chave API do Asaas não configurada (VITE_ASAAS_API_KEY)");
  return {
    "Content-Type": "application/json",
    "access_token": apiKey,
  };
};

export const asaasFetch = async (path, options = {}) => {
  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAsaasHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.errors?.[0]?.description || "Erro na API do Asaas");
  }
  return data;
};