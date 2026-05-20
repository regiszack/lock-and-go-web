import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi, AuthResponse } from '../api/auth';

interface AuthContextData {
  user: AuthResponse | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const stored = await SecureStore.getItemAsync('userData');
      if (token && stored) {
        setUser(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { data } = await authApi.login(email, password);
    await persistSession(data);
  }

  async function signUp(name: string, email: string, password: string, phone?: string) {
    const { data } = await authApi.register(name, email, password, phone);
    await persistSession(data);
  }

  async function persistSession(data: AuthResponse) {
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    await SecureStore.setItemAsync('userData', JSON.stringify(data));
    setUser(data);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userData');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
