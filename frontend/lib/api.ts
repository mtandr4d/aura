import axios from 'axios';
import { storage } from './storage';

const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL || '';
export const API_BASE = `${BACKEND}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem('cm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiError(err: any): string {
  return (
    err?.response?.data?.detail ||
    err?.message ||
    'Erro de conexão'
  );
}
