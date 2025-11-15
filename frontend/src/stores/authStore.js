import { create } from 'zustand';
import axios from 'axios';

// Axios instance
export const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // ------- ROLE CHECKS -------
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  },

  isSuperAdmin: () => {
    const user = get().user;
    return user?.role === 'superadmin';
  },

  isTeacher: () => {
    const user = get().user;
    return user?.role === 'teacher';
  },

  isDeptAdmin: () => {
    const user = get().user;
    return user?.role === 'deptadmin';
  },

  // ------- LOGIN -------
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  // ------- CHANGE PASSWORD -------
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await API.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
      };
    }
  },

  // ------- UPDATE USER -------
  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // ------- LOGOUT -------
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
