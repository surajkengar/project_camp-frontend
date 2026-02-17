import { create } from "zustand";
import authService from "../api/authService";
import { StorageKeys } from "../utils/constants";

const getAvatarUrl = (user) => {
  if (!user) return null;
  return user.avatar?.url || "https://via.placeholder.com/200x200.png";
};

const initializeAuth = async (set) => {
  try {
    if (authService.isLoggedIn()) {
      const response = await authService.getCurrentUser();
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    }
  } catch (error) {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: error.response?.data?.message || "Failed to initialize auth",
      isInitialized: true,
    });
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
  }
};

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Initialize auth state from localStorage
  initialize: () => {
    // Skip if already initialized or currently loading
    if (get().isInitialized || get().isLoading) return;

    // Start the initialization process
    set({ isLoading: true });
    initializeAuth(set);
  },

  // Get user avatar URL
  getUserAvatar: () => {
    const { user } = get();
    return getAvatarUrl(user);
  },

  // Login user
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Login failed",
      });
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Registration failed",
      });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true, // Keep initialized status
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Logout failed",
      });
      // Still clear local state even if server logout fails
      localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true, // Keep initialized status
      });
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.verifyEmail(token);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Email verification failed",
      });
      throw error;
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.forgotPassword(email);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Password reset request failed",
      });
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.resetPassword(token, newPassword);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Password reset failed",
      });
      throw error;
    }
  },

  // Change password (authenticated)
  changePassword: async (oldPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.changePassword(
        oldPassword,
        newPassword
      );
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Password change failed",
      });
      throw error;
    }
  },

  // Resend email verification
  resendEmailVerification: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.resendEmailVerification();
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Failed to resend verification email",
      });
      throw error;
    }
  },

  // Check if user is verified
  isEmailVerified: () => {
    const { user } = get();
    return user?.isEmailVerified || false;
  },

  // Clear any errors
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
