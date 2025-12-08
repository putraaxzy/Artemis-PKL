/**
 * Global Type Definitions
 */

// tipe user
export type UserRole = "guru" | "siswa";

export interface User {
  id: number;
  username: string;
  name: string;
  telepon: string;
  role: UserRole;
  kelas?: string;
  jurusan?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

// tipe tugas
export type TaskStatus = "pending" | "dikirim" | "selesai" | "ditolak";
export type SubmissionType = "link" | "langsung";
export type TaskTarget = "siswa" | "kelas";

export interface Task {
  id: number;
  judul: string;
  target: TaskTarget;
  tipe_pengumpulan: SubmissionType;
  guru?: string;
  status?: TaskStatus;
  total_siswa?: number;
  pending?: number;
  dikirim?: number;
  selesai?: number;
  dibuat_pada: string;
  diperbarui_pada?: string;
}

export interface TaskDetail extends Task {
  id_target: any[];
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

// tipe penugasan
export interface Penugasan {
  id: number;
  siswa: User;
  status: TaskStatus;
  link_drive?: string;
  tanggal_pengumpulan?: string;
  nilai?: number;
  catatan_guru?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}

// tipe respons api
export interface ApiResponse<T = any> {
  berhasil: boolean;
  data: T;
  pesan: string;
}

export interface AuthResponse {
  token: string;
  pengguna: User;
}

export interface RegisterOptions {
  kelas: string[];
  jurusan: string[];
}

// tipe form
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  name: string;
  telepon: string;
  password: string;
  confirmPassword: string;
  kelas: string;
  jurusan: string;
}

export interface CreateTaskFormData {
  judul: string;
  target: TaskTarget;
  tipe_pengumpulan: SubmissionType;
  tampilkan_nilai: boolean;
  id_target: number[] | Array<{ kelas: string; jurusan: string }>;
}

export interface SubmitTaskFormData {
  link_drive?: string;
}

export interface UpdateAssignmentFormData {
  status: "selesai" | "ditolak";
  nilai?: number;
  catatan_guru?: string;
}

// tipe props komponen
export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

// tipe return hook
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  isGuru: boolean;
  isSiswa: boolean;
}

// tipe utility
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T> = () => Promise<T>;

// tipe error
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// tipe paginasi
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
