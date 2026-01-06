import { create } from 'zustand';
import { AuthState, User } from '@types/index';
import api from '../services/api';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,

  setToken: (token: string) => {
    localStorage.setItem('authToken', token);
    set({ token });
  },

  setUser: (user: User) => {
    set({ user });
  },

  register: async (email: string, name: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(email, name, password);
      const { access_token, user } = response.data;
      
      localStorage.setItem('authToken', access_token);
      set({ 
        token: access_token, 
        user,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      const { access_token, user } = response.data;
      
      localStorage.setItem('authToken', access_token);
      set({ 
        token: access_token, 
        user,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, token: null });
  },
}));
