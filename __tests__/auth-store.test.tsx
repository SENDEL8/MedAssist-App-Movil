import { useAuthStore } from "@/store/authStore";

jest.mock("@/services/api", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    getMe: jest.fn(),
  },
}));

jest.mock("@/utils/storage", () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

import { authApi } from "@/services/api";
import { storage } from "@/utils/storage";

const mockAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockStorage = storage as jest.Mocked<typeof storage>;

describe("AuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().logout();
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = { id: 1, email: "test@med.com", full_name: "Test User", created_at: "2024-01-01" };
      const mockToken = "mock.access.token";
      const mockRefreshToken = "mock.refresh.token";

      mockAuthApi.login.mockResolvedValue({
        access_token: mockToken,
        refresh_token: mockRefreshToken,
        token_type: "bearer",
        user: mockUser,
      });

      await useAuthStore.getState().login("test@med.com", "Password1!");

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.refreshToken).toBe(mockRefreshToken);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should set error on login failure", async () => {
      mockAuthApi.login.mockRejectedValue({
        response: { data: { detail: "Correo o contrasena incorrectos" } },
      });

      await expect(
        useAuthStore.getState().login("test@med.com", "wrong"),
      ).rejects.toThrow("Correo o contrasena incorrectos");

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Correo o contrasena incorrectos");
    });
  });

  describe("logout", () => {
    it("should clear all auth state", async () => {
      mockAuthApi.login.mockResolvedValue({
        access_token: "token",
        refresh_token: "refresh",
        token_type: "bearer",
        user: { id: 1, email: "test@med.com", full_name: "Test", created_at: "2024-01-01" },
      });

      await useAuthStore.getState().login("test@med.com", "Password1!");
      expect(useAuthStore.getState().user).not.toBeNull();

      mockStorage.deleteItem.mockClear();

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.error).toBeNull();
      expect(mockStorage.deleteItem).toHaveBeenCalledTimes(3);
    });
  });

  describe("clearError", () => {
    it("should clear the error state", () => {
      useAuthStore.setState({ error: "Some error" });
      expect(useAuthStore.getState().error).toBe("Some error");

      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
