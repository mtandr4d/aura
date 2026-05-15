import axios from 'axios';
import { storage } from './storage';

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL || '';
export const API_BASE = `${BACKEND}/api`;

console.log('[API] Backend URL:', BACKEND);
console.log('[API] API Base:', API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // Aumentado para 30s
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('cm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Melhor tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Tempo esgotado. Tente novamente.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Erro de conexão. Verifique sua internet.';
    } else if (!error.response) {
      error.message = 'Sem conexão com o servidor.';
    }
    return Promise.reject(error);
  }
);

export function apiError(err: any): string {
  return (
    err?.response?.data?.detail ||
    err?.message ||
    'Erro de conexão'
  );
}
