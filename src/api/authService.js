import { StorageKeys } from "../utils/constants";
import axiosInstance from "./axios";

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data?.data?.accessToken) {
      localStorage.setItem(
        StorageKeys.ACCESS_TOKEN,
        response.data.data.accessToken
      );

      // Optionally store refresh token if needed
      if (response.data?.data?.refreshToken) {
        localStorage.setItem(
          StorageKeys.REFRESH_TOKEN,
          response.data.data.refreshToken
        );
      }
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get("/auth/current-user");
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await axiosInstance.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, {
      newPassword,
    });
    return response.data;
  },

  // Change password (authenticated)
  changePassword: async (oldPassword, newPassword) => {
    const response = await axiosInstance.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Resend email verification
  resendEmailVerification: async () => {
    const response = await axiosInstance.post(
      "/auth/resend-email-verification"
    );
    return response.data;
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(StorageKeys.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axiosInstance.post("/auth/refresh-token", {
      refreshToken,
    });

    if (response.data?.data?.accessToken) {
      localStorage.setItem(
        StorageKeys.ACCESS_TOKEN,
        response.data.data.accessToken
      );

      // Update refresh token if a new one is provided
      if (response.data?.data?.refreshToken) {
        localStorage.setItem(
          StorageKeys.REFRESH_TOKEN,
          response.data.data.refreshToken
        );
      }
    }

    return response.data;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  },
};

export default authService;
