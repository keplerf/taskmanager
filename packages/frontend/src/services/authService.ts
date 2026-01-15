import { api } from './api';
import { useAuthStore } from '../stores/authStore';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export async function login(credentials: LoginRequest) {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  const { user, accessToken, refreshToken } = response.data.data;

  useAuthStore.getState().setAuth(user, accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  return response.data.data;
}

export async function register(data: RegisterRequest) {
  const response = await api.post<AuthResponse>('/auth/register', data);
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
