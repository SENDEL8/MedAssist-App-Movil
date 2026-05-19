import axios from "axios";
import { API_URL } from "@/constants/config";
import { storage } from "@/utils/storage";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItem("auth_token");
      await storage.deleteItem("auth_user");
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  async register(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/v1/auth/register", {
      email,
      password,
      full_name,
    });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/v1/auth/login", {
      email,
      password,
    });
    return data;
  },

  async getMe(token: string): Promise<User> {
    const { data } = await api.get<User>("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};

export { api };
