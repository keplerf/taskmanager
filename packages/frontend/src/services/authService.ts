import { api } from './api';
import { useAuthStore } from '../stores/authStore';
import type { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '../types';

export async function login(credentials: LoginRequest) {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  const { user, accessToken, refreshToken } = response.data.data;

  useAuthStore.getState().setAuth(user, accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  return response.data.data;
}

export async function register(data: RegisterRequest) {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  const { user, accessToken, refreshToken } = response.data.data;

  useAuthStore.getState().setAuth(user, accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  return response.data.data;
}

export async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore errors during logout
    }
  }

  useAuthStore.getState().logout();
  localStorage.removeItem('refreshToken');
}

export async function forgotPassword(email: string) {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  return response.data.data;
}

export async function resetPassword(token: string, password: string) {
  const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, password });
  return response.data.data;
}
