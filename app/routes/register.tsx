import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  authService,
  tokenService,
  userService,
  type RegisterOptions,
} from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Alert } from "../components/Alert";

export function meta() {
  return [
    { title: "Register - Tugas" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    telepon: "",
    password: "",
    confirmPassword: "",
    kelas: "",
    jurusan: "",
  });

  const [options, setOptions] = useState<RegisterOptions | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const navigate = useNavigate();

  // ambil opsi register saat komponen mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await authService.getRegisterOptions();
        if (response.berhasil) {
          setOptions(response.data);
        } else {
          setError(response.pesan || "Failed to load options");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load options");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username harus diisi");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("Username hanya boleh berisi huruf, angka, dan garis bawah");
      return false;
    }

    if (!formData.name.trim()) {
      setError("Nama harus diisi");
      return false;
    }

    if (!formData.telepon.trim()) {
      setError("Nomor telepon harus diisi");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return false;
    }

    if (!formData.kelas) {
      setError("Kelas harus dipilih");
      return false;
    }

    if (!formData.jurusan) {
      setError("Jurusan harus dipilih");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        username: formData.username,
        name: formData.name,
        telepon: formData.telepon,
        password: formData.password,
        role: "siswa",
        kelas: formData.kelas,
        jurusan: formData.jurusan,
      });

      if (response.berhasil) {
        tokenService.setToken(response.data.token);
        userService.setUser(response.data.pengguna);
        window.location.href = "/tasks";
      } else {
        setError(response.pesan || "Registration failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Buat Akun</h1>
            <p className="text-gray-600 text-sm mt-1">
              Daftar untuk mulai mengelola tugas Anda
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              helperText="Hanya huruf, angka, dan garis bawah"
            />

            <Input
              label="Nama Lengkap"
              type="text"
              name="name"
              placeholder="nama lengkap anda"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <Input
              label="Nomor Telepon"
              type="tel"
              name="telepon"
              placeholder="081234567890"
              value={formData.telepon}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kelas
                </label>
                <select
                  name="kelas"
                  value={formData.kelas}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Pilih</option>
                  {options?.kelas.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Jurusan
                </label>
                <select
                  name="jurusan"
                  value={formData.jurusan}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Pilih</option>
                  {options?.jurusan.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              helperText="Minimal 8 karakter"
            />

            <Input
              label="Konfirmasi Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="md"
            >
              Buat Akun
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-gray-900 font-medium hover:underline"
            >
              Masuk
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
