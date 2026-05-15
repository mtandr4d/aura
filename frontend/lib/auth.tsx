import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from './storage';
import { api } from './api';

export type Role = 'patient' | 'caregiver' | 'responsible';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  patient_code?: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, full_name: string, role: Role) => Promise<User>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await storage.getItem('cm_token');
      if (!token) {
        setUser(null);
        return;
      }
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      await storage.removeItem('cm_token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('[AUTH] Iniciando login...', email);
      const { data } = await api.post('/auth/login', { email, password });
      console.log('[AUTH] Login bem-sucedido');
      await storage.setItem('cm_token', data.access_token);
      setUser(data.user);
      return data.user as User;
    } catch (error) {
      console.error('[AUTH] Erro no login:', error);
      throw error;
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, full_name: string, role: Role) => {
      try {
        console.log('[AUTH] Iniciando cadastro...', email, role);
        const { data } = await api.post('/auth/register', { email, password, full_name, role });
        console.log('[AUTH] Cadastro bem-sucedido');
        await storage.setItem('cm_token', data.access_token);
        setUser(data.user);
        return data.user as User;
      } catch (error) {
        console.error('[AUTH] Erro no cadastro:', error);
        throw error;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      console.log('[AUTH] Iniciando logout...');
      await storage.removeItem('cm_token');
      await storage.removeItem('cm_user');
      await storage.removeItem('cm_active_patient_id');
      setUser(null);
      console.log('[AUTH] Logout completo, usuário removido');
      return true;
    } catch (error) {
      console.error('[AUTH] Erro no logout:', error);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
