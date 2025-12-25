import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { taskService, type Task } from "../services";
import { useAuth } from "../hooks";
import { Header, Card, Alert, Button } from "../components";
import {
  MdTask,
  MdLink,
  MdFilePresent,
  MdEdit,
  MdDelete,
  MdWarning,
} from "react-icons/md";

export function meta() {
  return [
    { title: "Tasks - Tugas" },
    { name: "description", content: "Manage your tasks" },
  ];
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isGuru,
    isSiswa,
    user,
    isLoading: authLoading,
  } = useAuth();

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await taskService.getTasks();

      if (response.berhasil) {
        setTasks(response.data);
      } else {
        setError(response.pesan || "Failed to fetch tasks");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching tasks."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchTasks();
  }, [isAuthenticated, authLoading, navigate]);

  const handleDelete = async (taskId: number) => {
    setIsDeleting(true);
    try {
      const response = await taskService.deleteTask(taskId);
      if (response.berhasil) {
        await fetchTasks();
        setDeleteId(null);
      } else {
        setError(response.pesan || "Gagal menghapus tugas");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus tugas");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "selesai":
        return "bg-green-50 text-green-700 border-green-200";
      case "dikirim":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "ditolak":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "selesai":
        return "Selesai";
      case "dikirim":
        return "Dikirim";
      case "pending":
        return "Menunggu";
      case "ditolak":
        return "Ditolak";
      default:
        return "Tidak Diketahui";
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daftar Tugas</h1>
              <p className="text-gray-600 text-sm mt-1">
                {isGuru
                  ? "Tugas yang Anda buat"
                  : "Tugas yang ditugaskan ke Anda"}
              </p>
            </div>
            {isGuru && (
              <Button
                onClick={() => navigate("/create-task")}
                className="mt-4 sm:mt-0 bg-gray-900 hover:bg-gray-800"
              >
                + Buat Tugas
              </Button>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Memuat tugas...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && tasks.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-12 flex flex-col items-center">
              <MdTask className="text-gray-400 text-6xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada tugas
              </h3>
              <p className="text-gray-600 text-sm">
                {isGuru
                  ? "Buat tugas pertama Anda untuk memulai"
                  : "Belum ada tugas yang ditugaskan ke Anda"}
              </p>
            </div>
          )}

          {/* Tasks Grid */}
          {!isLoading && tasks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  <div
                    className="p-6 space-y-4 cursor-pointer flex-1"
                    onClick={() => navigate(`/dashboard/${task.id}`)}
                  >
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {task.judul}
                    </h3>

                    {/* Status Badge */}
                    {task.status && (
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusLabel(task.status)}
                      </div>
                    )}

                    {/* Task Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {isGuru ? (
                        <>
                          <div className="flex justify-between">
                            <span>Total Siswa:</span>
                            <span className="font-semibold text-gray-900">
                              {task.total_siswa || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Dikirim:</span>
                            <span className="font-semibold text-gray-900">
                              {task.dikirim || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Selesai:</span>
                            <span className="font-semibold text-gray-900">
                              {task.selesai || 0}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Guru:</span>
                            <span className="font-semibold text-gray-900">
                              {task.guru || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tipe:</span>
                            <span className="font-semibold text-gray-900 capitalize flex items-center gap-1">
                              {task.tipe_pengumpulan === "link" ? (
                                <>
                                  <MdLink className="w-4 h-4" />
                                  Online
                                </>
                              ) : (
                                <>
                                  <MdFilePresent className="w-4 h-4" />
                                  Langsung
                                </>
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Dibuat Pada:{" "}
                      {new Date(task.dibuat_pada).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Action Buttons for Guru */}
                  {isGuru && (
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-task/${task.id}`);
                        }}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 flex items-center justify-center gap-2"
                      >
                        <MdEdit /> Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(task.id);
                        }}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200 flex items-center justify-center gap-2"
                      >
                        <MdDelete /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-slide-in-left">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MdWarning className="text-5xl text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hapus Tugas?
              </h3>
              <p className="text-gray-600 text-sm">
                Tugas ini akan dihapus permanen. Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={() => handleDelete(deleteId)}
                isLoading={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
