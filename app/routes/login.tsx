import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { authService, tokenService, userService } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Alert } from "../components/Alert";
import { useAuth } from "../hooks/useAuth";

export function meta() {
  return [
    { title: "login - tugas" },
    { name: "description", content: "masuk ke sistem manajemen tugas" },
  ];
}

export default function Login() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("sessionExpired") === "true") {
      setError("session anda telah berakhir. silakan login kembali.");
    }
  }, [location.search]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });

      if (response.berhasil) {
        tokenService.setToken(response.data.token);
        userService.setUser(response.data.pengguna);
        window.location.href = "/dashboard";
      } else {
        setError(response.pesan || "login gagal");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "terjadi kesalahan. silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return null;
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/batik.png" alt="artemis smea" className="h-25" />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Selamat Datang!
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              masuk ke akun anda untuk melanjutkan
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="username"
              type="text"
              placeholder="masukkan username anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              label="password"
              type="password"
              placeholder="masukkan password anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="md"
            >
              masuk
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            belum punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-gray-900 font-medium hover:underline"
            >
              daftar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
