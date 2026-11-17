import { create } from 'zustand';
import api from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  initialized: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
    set({ user, token, error: null });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      get().setAuth(res.data.user, res.data.token);
      set({ loading: false });
      return res.data.user;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Login failed' });
      throw err;
    }
  },

  demoLogin: async (role = 'assistant') => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/demo-login', { role });
      get().setAuth(res.data.user, res.data.token);
      set({ loading: false });
      return res.data.user;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Demo login failed' });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      get().setAuth(res.data.user, res.data.token);
      set({ loading: false });
      return res.data.user;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Registration failed' });
      throw err;
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ initialized: true, user: null, token: null });
      return null;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, initialized: true });
      return res.data.user;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, initialized: true });
      return null;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  switchRoleLocally: async (newRole) => {
    return get().demoLogin(newRole);
  },
}));
