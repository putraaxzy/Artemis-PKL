/**
 * API Configuration
 * Centralized API URL configuration
 */

/**
 * API base URL configuration
 */
export const API_BASE_URL = "http://localhost:8000/api";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER_OPTIONS: "/auth/register-options",
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },

  // Tasks
  TASKS: {
    LIST: "/tugas",
    CREATE: "/tugas",
    DETAIL: (id: number) => `/tugas/${id}/detail`,
    SUBMIT: (id: number) => `/tugas/${id}/submit`,
    PENDING: (id: number) => `/tugas/${id}/pending`,
    REMINDER: (id: number) => `/tugas/${id}/reminder`,
  },

  // Assignments
  ASSIGNMENTS: {
    UPDATE_STATUS: (id: number) => `/tugas/penugasan/${id}/status`,
  },

  // Bot
  BOT: {
    REMINDER: "/bot/reminder",
    REMINDER_HISTORY: (taskId: number) => `/bot/reminder/${taskId}`,
  },
} as const;

/**
 * Build full API URL
 */
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
