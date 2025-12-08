/**
 * API Service - Centralized API handling for backend communication
 * Handles all HTTP requests, authentication, and error management
 */

import { API_BASE_URL, API_ENDPOINTS } from "../config";

// ============================================================================
// tipe dan interface
// ============================================================================

export interface ApiResponse<T = any> {
  berhasil: boolean;
  data: T;
  pesan: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  telepon: string;
  role: "guru" | "siswa";
  kelas?: string;
  jurusan?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface AuthResponse {
  token: string;
  pengguna: User;
}

export interface Task {
  id: number;
  judul: string;
  target: "siswa" | "kelas";
  tipe_pengumpulan: "link" | "langsung";
  guru?: string;
  status?: "pending" | "dikirim" | "selesai" | "ditolak";
  total_siswa?: number;
  pending?: number;
  dikirim?: number;
  selesai?: number;
  deskripsi?: string;
  file_detail?: string;
  tanggal_mulai?: string;
  tanggal_deadline?: string;
  tampilkan_nilai?: boolean;
  dibuat_pada: string;
  diperbarui_pada?: string;
}

export interface TaskDetail extends Task {
  id_target: any[];
  deskripsi?: string;
  file_detail?: string;
  tanggal_mulai?: string;
  tanggal_deadline?: string;
  tampilkan_nilai: boolean;
  statistik: {
    total_siswa: number;
    pending: number;
    dikirim: number;
    selesai: number;
    ditolak: number;
  };
  penugasan: Penugasan[];
}

export interface Penugasan {
  id: number;
  siswa: User;
  status: "pending" | "dikirim" | "selesai" | "ditolak";
  link_drive?: string;
  tanggal_pengumpulan?: string;
  nilai?: number;
  catatan_guru?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

export interface RegisterOptions {
  kelas: string[];
  jurusan: string[];
}

export interface Siswa {
  id: number;
  username: string;
  name: string;
  kelas: string;
  jurusan: string;
}

export interface KelasInfo {
  kelas: string;
  jurusan: string;
  jumlah_siswa: number;
}

// ============================================================================
// fungsi utility
// ============================================================================

/**
 * Get authorization header with token
 */
function getAuthHeader(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Get authorization header for FormData (without Content-Type)
 */
function getFormDataAuthHeader(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Handle API response and errors
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.pesan || `HTTP Error: ${response.status}`);
  }

  return data;
}

/**
 * Generic fetch wrapper
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeader();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  return handleResponse<T>(response);
}

/**
 * FormData API call wrapper (for file uploads)
 */
async function apiCallFormData<T>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestInit, "body" | "headers"> = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getFormDataAuthHeader();

  const response = await fetch(url, {
    ...options,
    method: "POST",
    body: formData,
    headers,
  });

  return handleResponse<T>(response);
}

// ============================================================================
// endpoint autentikasi
// ============================================================================

export const authService = {
  /**
   * Get registration options (kelas and jurusan)
   */
  async getRegisterOptions(): Promise<ApiResponse<RegisterOptions>> {
    return apiCall<RegisterOptions>("/auth/register-options");
  },

  /**
   * Register new user (siswa only)
   */
  async register(payload: {
    username: string;
    name: string;
    telepon: string;
    password: string;
    role: "siswa";
    kelas: string;
    jurusan: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return apiCall<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Login user
   */
  async login(payload: {
    username: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiCall<null>("/auth/logout", {
      method: "POST",
    });
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiCall<User>("/auth/me");
  },
};

// ============================================================================
// endpoint manajemen tugas
// ============================================================================

export const taskService = {
  /**
   * Get all tasks (guru: created tasks, siswa: received tasks)
   */
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return apiCall<Task[]>("/tugas");
  },

  /**
   * Get task detail (guru only)
   */
  async getTaskDetail(taskId: number): Promise<ApiResponse<TaskDetail>> {
    return apiCall<TaskDetail>(`/tugas/${taskId}/detail`);
  },

  /**
   * Create new task (guru only)
   * Supports optional file upload, dates, and description
   */
  async createTask(payload: {
    judul: string;
    deskripsi?: string;
    target: "siswa" | "kelas";
    id_target: number[] | Array<{ kelas: string; jurusan: string }>;
    tipe_pengumpulan: "link" | "langsung";
    file_detail?: File;
    tanggal_mulai?: string;
    tanggal_deadline?: string;
    tampilkan_nilai: boolean;
  }): Promise<ApiResponse<Task>> {
    // jika ada file, pakai FormData
    if (payload.file_detail) {
      const formData = new FormData();
      formData.append("judul", payload.judul);

      if (payload.deskripsi) {
        formData.append("deskripsi", payload.deskripsi);
      }

      formData.append("target", payload.target);

      // backend mengharapkan JSON.stringify() untuk id_target di FormData
      formData.append("id_target", JSON.stringify(payload.id_target));

      formData.append("tipe_pengumpulan", payload.tipe_pengumpulan);
      formData.append("file_detail", payload.file_detail);

      if (payload.tanggal_mulai) {
        formData.append("tanggal_mulai", payload.tanggal_mulai);
      }

      if (payload.tanggal_deadline) {
        formData.append("tanggal_deadline", payload.tanggal_deadline);
      }

      formData.append("tampilkan_nilai", String(payload.tampilkan_nilai));

      console.log(
        "Sending FormData with id_target:",
        JSON.stringify(payload.id_target)
      );
      return apiCallFormData<Task>("/tugas", formData);
    }

    // atau pakai JSON biasa
    const jsonPayload: any = {
      judul: payload.judul,
      target: payload.target,
      id_target: payload.id_target,
      tipe_pengumpulan: payload.tipe_pengumpulan,
      tampilkan_nilai: payload.tampilkan_nilai,
    };

    if (payload.deskripsi) {
      jsonPayload.deskripsi = payload.deskripsi;
    }

    if (payload.tanggal_mulai) {
      jsonPayload.tanggal_mulai = payload.tanggal_mulai;
    }

    if (payload.tanggal_deadline) {
      jsonPayload.tanggal_deadline = payload.tanggal_deadline;
    }

    console.log("Sending JSON payload:", jsonPayload);
    return apiCall<Task>("/tugas", {
      method: "POST",
      body: JSON.stringify(jsonPayload),
    });
  },

  /**
   * Submit task (siswa only)
   */
  async submitTask(
    taskId: number,
    payload: {
      link_drive?: string;
    }
  ): Promise<ApiResponse<Penugasan>> {
    return apiCall<Penugasan>(`/tugas/${taskId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get pending assignments (guru only)
   */
  async getPendingAssignments(
    taskId: number
  ): Promise<ApiResponse<Penugasan[]>> {
    return apiCall<Penugasan[]>(`/tugas/${taskId}/pending`);
  },

  /**
   * Update assignment status (guru only)
   */
  async updateAssignmentStatus(
    penugasanId: number,
    payload: {
      status: "selesai" | "ditolak";
      nilai?: number;
      catatan_guru?: string;
    }
  ): Promise<ApiResponse<Penugasan>> {
    return apiCall<Penugasan>(`/tugas/penugasan/${penugasanId}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete task (guru only)
   */
  async deleteTask(taskId: number): Promise<ApiResponse<any>> {
    return apiCall<any>(`/tugas/${taskId}`, {
      method: "DELETE",
    });
  },

  /**
   * Update task (guru only)
   */
  async updateTask(
    taskId: number,
    payload: FormData
  ): Promise<ApiResponse<Task>> {
    return apiCallFormData<Task>(`/tugas/${taskId}`, {
      method: "POST", // laravel pakai POST dengan _method=PUT untuk FormData
      body: payload,
    });
  },

  /**
   * Send reminder to pending students (guru only)
   */
  async sendReminder(taskId: number): Promise<ApiResponse<any>> {
    return apiCall<any>(`/tugas/${taskId}/reminder`, {
      method: "POST",
    });
  },
};

// ============================================================================
// endpoint siswa
// ============================================================================

export const siswaService = {
  /**
   * Get all siswa
   */
  async getAllSiswa(): Promise<ApiResponse<Siswa[]>> {
    return apiCall<Siswa[]>("/siswa");
  },

  /**
   * Get all available kelas
   */
  async getKelas(): Promise<ApiResponse<KelasInfo[]>> {
    return apiCall<KelasInfo[]>("/siswa/kelas");
  },

  /**
   * Get siswa by kelas
   */
  async getSiswaByKelas(payload: {
    kelas: string;
    jurusan: string;
  }): Promise<
    ApiResponse<{ pencarian: any; ditemukan: number; data: Siswa[] }>
  > {
    return apiCall<{ pencarian: any; ditemukan: number; data: Siswa[] }>(
      "/siswa/by-kelas",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};

// ============================================================================
// endpoint bot reminder
// ============================================================================

export const botService = {
  /**
   * Record reminder from bot
   */
  async recordReminder(payload: {
    id_tugas: number;
    id_siswa: number;
    pesan: string;
    id_pesan: string;
  }): Promise<ApiResponse<null>> {
    return apiCall<null>("/bot/reminder", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get reminder history (guru only)
   */
  async getReminderHistory(taskId: number): Promise<ApiResponse<any[]>> {
    return apiCall<any[]>(`/bot/reminder/${taskId}`);
  },
};

// ============================================================================
// manajemen token
// ============================================================================

export const tokenService = {
  /**
   * Save token to localStorage
   */
  setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  /**
   * Remove token from localStorage
   */
  removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
  },

  /**
   * Check if token exists
   */
  hasToken(): boolean {
    return !!this.getToken();
  },
};

// ============================================================================
// User Management
// ============================================================================

export const userService = {
  /**
   * Save user info to localStorage
   */
  setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role);
  },

  /**
   * Get user info from localStorage
   */
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get user role
   */
  getRole(): "guru" | "siswa" | null {
    if (typeof window === "undefined") return null;
    const role = localStorage.getItem("role");
    return role as "guru" | "siswa" | null;
  },

  /**
   * Clear user data
   */
  clearUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  },

  /**
   * Check if user is guru
   */
  isGuru(): boolean {
    return this.getRole() === "guru";
  },

  /**
   * Check if user is siswa
   */
  isSiswa(): boolean {
    return this.getRole() === "siswa";
  },
};
