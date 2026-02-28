import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      wallet: null,
      
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({ user: data.user, token: data.token });
        return data;
      },
      
      signup: async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({ user: data.user, token: data.token });
        return data;
      },
      
      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, wallet: null });
      },
      
      refreshMe: async () => {
        const { data } = await api.get('/auth/me');
        set({ user: data.user, wallet: data.wallet });
        return data;
      },
      
      updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),
      setWallet: (wallet) => set({ wallet }),
    }),
    {
      name: 'skillswap-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      }
    }
  )
);
