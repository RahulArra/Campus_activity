import {create} from 'zustand';
import axios from 'axios';

// Create a basic Axios instance with your backend URL (Naveen's server)
export const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL , // Assume backend runs on port 5000
});

// Axios interceptor to automatically attach the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // cite: 2.1
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // cite: 2.1
  }
  return config;
});

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),

  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  },

  isSuperAdmin: () => {
    const user = get().user;
    return user?.role === 'superadmin';
  },

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;