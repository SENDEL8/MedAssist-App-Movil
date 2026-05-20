import { create } from "zustand";
import { authApi, User } from "@/services/api";
import { storage } from "@/utils/storage";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isRestored: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isRestored: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      await storage.setItem(TOKEN_KEY, response.access_token);
      await storage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      await storage.setItem(USER_KEY, JSON.stringify(response.user));
      set({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.detail || "Error al iniciar sesion";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (email: string, password: string, full_name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(email, password, full_name);
      await storage.setItem(TOKEN_KEY, response.access_token);
      await storage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      await storage.setItem(USER_KEY, JSON.stringify(response.user));
      set({
        user: response.user,
        token: response.access_token,
        refreshToken: response.refresh_token,
        isLoading: false,
      });
    } catch (err: any) {
      const message = err.response?.data?.detail || "Error al registrar";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
    await storage.deleteItem(USER_KEY);
    set({ user: null, token: null, refreshToken: null, error: null, isLoading: false });
  },

  restoreSession: async () => {
    try {
      const [token, refreshToken, userStr] = await Promise.all([
        storage.getItem(TOKEN_KEY),
        storage.getItem(REFRESH_TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);

      if (token && userStr && !isTokenExpired(token)) {
        set({ token, refreshToken, user: JSON.parse(userStr), isRestored: true });
        return;
      }

      if (refreshToken) {
        const refreshed = await get().refreshAccessToken();
        if (refreshed) return;
      }

      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(REFRESH_TOKEN_KEY);
      await storage.deleteItem(USER_KEY);
      set({ isRestored: true });
    } catch {
      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(REFRESH_TOKEN_KEY);
      await storage.deleteItem(USER_KEY);
      set({ isRestored: true });
    }
  },

  refreshAccessToken: async () => {
    try {
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await authApi.refreshToken(refreshToken);
      await storage.setItem(TOKEN_KEY, response.access_token);
      await storage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);

      set({
        token: response.access_token,
        refreshToken: response.refresh_token,
      });
      return true;
    } catch {
      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(REFRESH_TOKEN_KEY);
      await storage.deleteItem(USER_KEY);
      set({ user: null, token: null, refreshToken: null });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
