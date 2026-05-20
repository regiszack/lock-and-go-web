import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = 'http://10.0.2.2:8080/api'; // Android emulator → localhost
// export const API_URL = 'http://localhost:8080/api'; // iOS simulator / web

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
    return Promise.reject(error);
  }
);
