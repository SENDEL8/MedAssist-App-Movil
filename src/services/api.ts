import axios from "axios";
import { API_URL } from "@/constants/config";
import { storage } from "@/utils/storage";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
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
      const originalRequest = error.config;

      if (originalRequest?.url?.includes("/auth/refresh")) {
        await storage.deleteItem("auth_token");
        await storage.deleteItem("auth_refresh_token");
        await storage.deleteItem("auth_user");
        return Promise.reject(error);
      }

      if (!originalRequest._retried) {
        originalRequest._retried = true;
        try {
          const refreshToken = await storage.getItem("auth_refresh_token");
          if (refreshToken) {
            const { data } = await api.post<RefreshResponse>("/api/v1/auth/refresh", {
              refresh_token: refreshToken,
            });
            await storage.setItem("auth_token", data.access_token);
            await storage.setItem("auth_refresh_token", data.refresh_token);
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            return api(originalRequest);
          }
        } catch {
          await storage.deleteItem("auth_token");
          await storage.deleteItem("auth_refresh_token");
          await storage.deleteItem("auth_user");
        }
      }
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
  refresh_token: string;
  token_type: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  email: string;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  async register(email: string, password: string, full_name: string): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/api/v1/auth/register", {
      email,
      password,
      full_name,
    });
    return data;
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/v1/auth/verify-email", {
      email,
      code,
    });
    return data;
  },

  async resendCode(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/api/v1/auth/resend-code", {
      email,
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

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await api.post<RefreshResponse>("/api/v1/auth/refresh", {
      refresh_token: refreshToken,
    });
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/api/v1/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/api/v1/auth/forgot-password", { email });
    return data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/api/v1/auth/reset-password", {
      email,
      code,
      new_password: newPassword,
    });
    return data;
  },
};

export interface ConsultationRequest {
  age: number;
  gender: string;
  temperature: number;
  heart_rate: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  symptoms: string[];
  description?: string;
}

export interface ConsultationResponse {
  resumen: string;
  nivel_atencion: string;
  recomendacion: string;
}

export interface ConsultationHistoryItem {
  id: number;
  age: number | null;
  gender: string | null;
  temperature: number | null;
  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  symptoms: string;
  description: string;
  resumen: string;
  nivel_atencion: string;
  recomendacion: string;
  created_at: string;
}

export interface ExtractedValue {
  name: string;
  value: string;
  unit: string;
  reference_range: string;
  is_out_of_range: boolean;
}

export interface LabExamResponse {
  extracted_values: ExtractedValue[];
  plain_language_summary: string;
}

export interface LabExamHistoryItem {
  id: number;
  extracted_values: ExtractedValue[];
  plain_language_summary: string;
  created_at: string;
}

export const medicalApi = {
  async createConsultation(data: ConsultationRequest): Promise<ConsultationResponse> {
    const { data: result } = await api.post<ConsultationResponse>(
      "/api/v1/medical/consultation",
      data,
    );
    return result;
  },

  async getConsultations(): Promise<ConsultationHistoryItem[]> {
    const { data } = await api.get<ConsultationHistoryItem[]>("/api/v1/medical/consultations");
    return data;
  },
};

export const labsApi = {
  async analyzeLabExam(formData: FormData): Promise<LabExamResponse> {
    const { data } = await api.post<LabExamResponse>(
      "/api/v1/labs/analyze",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data;
  },

  async getLabExams(): Promise<LabExamHistoryItem[]> {
    const { data } = await api.get<LabExamHistoryItem[]>("/api/v1/labs/history");
    return data;
  },
};

export { api };
