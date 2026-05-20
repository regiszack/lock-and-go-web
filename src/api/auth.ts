import { api } from './client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, phone?: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password, phone }),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
};
