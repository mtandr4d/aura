import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { storage } from './storage';
import { api } from './api';
import { useAuth, User } from './auth';

interface ActivePatientCtx {
  activePatient: User | null;
  patients: User[];
  loadingPatients: boolean;
  refreshPatients: () => Promise<void>;
  setActive: (p: User) => Promise<void>;
}

const Ctx = createContext<ActivePatientCtx | undefined>(undefined);

export function ActivePatientProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [activePatient, setActivePatient] = useState<User | null>(null);
  const [loadingPatients, setLoading] = useState(true);

  const refreshPatients = useCallback(async () => {
    if (!user) {
      setPatients([]);
      setActivePatient(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<User[]>('/patients/linked');
      setPatients(data);
      const stored = await storage.getItem('cm_active_patient_id');
      const found = data.find((p) => p.id === stored) || data[0] || null;
      setActivePatient(found);
      if (found) await storage.setItem('cm_active_patient_id', found.id);
    } catch {
      setPatients([]);
      setActivePatient(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refreshPatients();
  }, [refreshPatients]);

  const setActive = useCallback(async (p: User) => {
    setActivePatient(p);
    await storage.setItem('cm_active_patient_id', p.id);
  }, []);

  return (
    <Ctx.Provider value={{ activePatient, patients, loadingPatients, refreshPatients, setActive }}>
      {children}
    </Ctx.Provider>
  );
}

export function useActivePatient() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useActivePatient must be used within ActivePatientProvider');
  return ctx;
}
