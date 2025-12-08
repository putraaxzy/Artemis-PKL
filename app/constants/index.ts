/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "https://engine.ptraazxtt.my.id/api",
  TIMEOUT: 30000, // 30 seconds
};

// User Roles
export const ROLES = {
  GURU: "guru",
  SISWA: "siswa",
} as const;

// Task Status
export const TASK_STATUS = {
  PENDING: "pending",
  DIKIRIM: "dikirim",
  SELESAI: "selesai",
  DITOLAK: "ditolak",
} as const;

// Submission Types
export const SUBMISSION_TYPES = {
  LINK: "link",
  LANGSUNG: "langsung",
} as const;

// Classes
export const CLASSES = ["X", "XI", "XII"] as const;

// Majors
export const MAJORS = ["MPLB", "RPL", "PM", "TKJ", "AKL"] as const;

// Status Colors
export const STATUS_COLORS = {
  [TASK_STATUS.PENDING]: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  [TASK_STATUS.DIKIRIM]: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  [TASK_STATUS.SELESAI]: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  [TASK_STATUS.DITOLAK]: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
} as const;

// Status Labels
export const STATUS_LABELS = {
  [TASK_STATUS.PENDING]: "Pending",
  [TASK_STATUS.DIKIRIM]: "Submitted",
  [TASK_STATUS.SELESAI]: "Completed",
  [TASK_STATUS.DITOLAK]: "Rejected",
} as const;

// Submission Type Labels
export const SUBMISSION_TYPE_LABELS = {
  [SUBMISSION_TYPES.LINK]: "Online",
  [SUBMISSION_TYPES.LANGSUNG]: "Direct",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Unauthorized. Please log in again.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "Resource not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  REGISTER_SUCCESS: "Registration successful!",
  TASK_CREATED: "Task created successfully!",
  TASK_SUBMITTED: "Task submitted successfully!",
  TASK_UPDATED: "Task updated successfully!",
  LOGOUT_SUCCESS: "Logged out successfully!",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  ROLE: "role",
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  TASK_TITLE_MAX_LENGTH: 255,
  TEACHER_NOTES_MAX_LENGTH: 1000,
  PHONE_MIN_LENGTH: 10,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Timeouts
export const TIMEOUTS = {
  ALERT_DURATION: 5000, // 5 seconds
  REDIRECT_DELAY: 2000, // 2 seconds
} as const;
