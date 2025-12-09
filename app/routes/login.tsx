import React, { useState } from "react";
import { useNavigate } from "react-router";
import { authService, tokenService, userService } from "../services/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Alert } from "../components/Alert";

export function meta() {
  return [
    { title: "Login - Tugas" },
    { name: "description", content: "Login to Tugas Management System" },
  ];
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });

      if (response.berhasil) {
        tokenService.setToken(response.data.token);
        userService.setUser(response.data.pengguna);
        window.location.href = "/tasks";
      } else {
        setError(response.pesan || "Login failed");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo.png" 
            alt="Artemis SMEA" 
            className="h-32"
          />
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="text-gray-600 text-sm mt-1">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Masukkan username Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password Anda"
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
              Masuk
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-gray-900 font-medium hover:underline"
            >
              Daftar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
