import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { taskService, type TaskDetail, type Penugasan } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function meta() {
  return [
    { title: "Task Detail - Tugas" },
    { name: "description", content: "View task details" },
  ];
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isGuru,
    isSiswa,
    isLoading: authLoading,
  } = useAuth();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkDrive, setLinkDrive] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Guru grading state
  const [gradingPenugasanId, setGradingPenugasanId] = useState<number | null>(
    null
  );
  const [gradeNilai, setGradeNilai] = useState("");
  const [gradeCatatan, setGradeCatatan] = useState("");
  const [gradeStatus, setGradeStatus] = useState<"selesai" | "ditolak">(
    "selesai"
  );
  const [isGrading, setIsGrading] = useState(false);

  const fetchTaskDetail = async () => {
    if (!id) {
      setError("Task ID tidak ditemukan");
      return;
    }

    try {
      setIsLoading(true);
      const response = await taskService.getTaskDetail(parseInt(id));

      if (response.berhasil) {
        setTask(response.data);
      } else {
        setError(response.pesan || "Gagal memuat detail tugas");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat detail tugas."
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

    fetchTaskDetail();
  }, [isAuthenticated, authLoading, navigate, id]);

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!id) return;

    if (task?.tipe_pengumpulan === "link" && !linkDrive.trim()) {
      setSubmitError("Harap masukkan link Google Drive");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await taskService.submitTask(parseInt(id), {
        link_drive: linkDrive || undefined,
      });

      if (response.berhasil) {
        setSubmitSuccess(true);
        setLinkDrive("");
        // Refresh task detail to show updated status
        await fetchTaskDetail();
        setTimeout(() => {
          navigate("/tasks");
        }, 2000);
      } else {
        setSubmitError(response.pesan || "Gagal mengumpulkan tugas");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengumpulkan tugas."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGradeSubmit = async (penugasanId: number) => {
    setError(null);

    if (
      gradeStatus === "selesai" &&
      (!gradeNilai || isNaN(parseInt(gradeNilai)))
    ) {
      setError("Nilai harus diisi untuk status selesai");
      return;
    }

    const nilai = parseInt(gradeNilai);
    if (gradeStatus === "selesai" && (nilai < 0 || nilai > 100)) {
      setError("Nilai harus antara 0-100");
      return;
    }

    setIsGrading(true);

    try {
      const response = await taskService.updateAssignmentStatus(penugasanId, {
        status: gradeStatus,
        nilai: gradeStatus === "selesai" ? nilai : undefined,
        catatan_guru: gradeCatatan || undefined,
      });

      if (response.berhasil && id) {
        // Refresh task detail
        const taskResponse = await taskService.getTaskDetail(parseInt(id));
        if (taskResponse.berhasil) {
          setTask(taskResponse.data);
        }
        // Reset form
        setGradingPenugasanId(null);
        setGradeNilai("");
        setGradeCatatan("");
        setGradeStatus("selesai");
      } else {
        setError(response.pesan || "Gagal menyimpan penilaian");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan penilaian"
      );
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading task...</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !task) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert
              type="error"
              message={error || "Tugas tidak ditemukan"}
              onClose={() => navigate("/tasks")}
            />
            <Button
              onClick={() => navigate("/tasks")}
              className="mt-4"
              variant="secondary"
            >
              Kembali ke Daftar Tugas
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Button
            onClick={() => navigate("/tasks")}
            variant="ghost"
            size="sm"
            className="mb-6 hover:bg-gray-100"
          >
            ← Kembali
          </Button>

          {/* Task Header - Modern Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {task.judul}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  {new Date(task.dibuat_pada).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Task Info Grid - Compact */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Tipe</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {task.tipe_pengumpulan === "link"
                    ? "📱 Online"
                    : "📄 Langsung"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Target</p>
                <p className="font-semibold text-gray-900 text-sm capitalize">
                  {task.target}
                </p>
              </div>
              {isGuru && (
                <>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-600 mb-1">Total Siswa</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {task.statistik.total_siswa} 👥
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-600 mb-1">Nilai</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {task.tampilkan_nilai ? "✅ Ya" : "❌ Tidak"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Task Description & File */}
          {(task.deskripsi ||
            task.file_detail ||
            task.tanggal_mulai ||
            task.tanggal_deadline) && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Detail Tugas
              </h2>
              <div className="space-y-6">
                {task.deskripsi && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Deskripsi
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                        {task.deskripsi}
                      </p>
                    </div>
                  </div>
                )}

                {(task.tanggal_mulai || task.tanggal_deadline) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {task.tanggal_mulai && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <span>🚀</span> Mulai
                        </p>
                        <p className="text-gray-900 font-medium">
                          {new Date(task.tanggal_mulai).toLocaleString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}
                    {task.tanggal_deadline && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <span>⏰</span> Deadline
                        </p>
                        <p className="text-red-900 font-bold">
                          {new Date(task.tanggal_deadline).toLocaleString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {task.file_detail &&
                  (() => {
                    const fileUrl = `https://engine.ptraazxtt.my.id/storage/${task.file_detail}`;
                    const fileName =
                      task.file_detail.split("/").pop() || "file";
                    const fileExt =
                      fileName.split(".").pop()?.toLowerCase() || "";

                    const imageFormats = [
                      "jpg",
                      "jpeg",
                      "png",
                      "gif",
                      "webp",
                      "svg",
                      "bmp",
                    ];
                    const videoFormats = [
                      "mp4",
                      "webm",
                      "ogg",
                      "mov",
                      "avi",
                      "mkv",
                    ];
                    const audioFormats = ["mp3", "wav", "ogg", "aac", "m4a"];

                    return (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-1">
                          <span>📎</span> File Lampiran
                        </p>

                        {imageFormats.includes(fileExt) && (
                          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <img
                              src={fileUrl}
                              alt="Task attachment"
                              className="w-full h-auto max-w-full object-contain"
                            />
                          </div>
                        )}

                        {videoFormats.includes(fileExt) && (
                          <div className="bg-black rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <video
                              controls
                              className="w-full h-auto max-w-full"
                              preload="metadata"
                            >
                              <source src={fileUrl} type={`video/${fileExt}`} />
                              Browser Anda tidak mendukung video player.
                            </video>
                          </div>
                        )}

                        {audioFormats.includes(fileExt) && (
                          <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                            <audio
                              controls
                              className="w-full"
                              preload="metadata"
                            >
                              <source src={fileUrl} type={`audio/${fileExt}`} />
                              Browser Anda tidak mendukung audio player.
                            </audio>
                            <p className="text-sm text-gray-600 mt-3 text-center">
                              🎵 {fileName}
                            </p>
                          </div>
                        )}

                        {!imageFormats.includes(fileExt) &&
                          !videoFormats.includes(fileExt) &&
                          !audioFormats.includes(fileExt) && (
                            <a
                              href={fileUrl}
                              download
                              className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-md transition-all font-medium"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Download {fileName}
                            </a>
                          )}
                      </div>
                    );
                  })()}
              </div>
            </div>
          )}

          {/* Guru View - Statistics */}
          {isGuru && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Statistik Pengumpulan
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                    Menunggu
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {task.statistik.pending}
                  </p>
                </div>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 hover:shadow-sm transition-shadow">
                  <p className="text-xs text-blue-700 font-semibold uppercase mb-2">
                    Dikirim
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {task.statistik.dikirim}
                  </p>
                </div>
                <div className="bg-green-50 p-5 rounded-xl border border-green-200 hover:shadow-sm transition-shadow">
                  <p className="text-xs text-green-700 font-semibold uppercase mb-2">
                    Selesai
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {task.statistik.selesai}
                  </p>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-200 hover:shadow-sm transition-shadow">
                  <p className="text-xs text-red-700 font-semibold uppercase mb-2">
                    Ditolak
                  </p>
                  <p className="text-3xl font-bold text-red-900">
                    {task.statistik.ditolak}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Siswa View - Submit Form or Status */}
          {isSiswa && task.penugasan && task.penugasan[0] && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Status Pengumpulan
              </h2>

              {/* Display submission status */}
              <div className="mb-6 bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Status Tugas
                  </span>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold ${
                      task.penugasan[0].status === "pending"
                        ? "bg-gray-100 text-gray-800 border border-gray-300"
                        : task.penugasan[0].status === "dikirim"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : task.penugasan[0].status === "selesai"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    {task.penugasan[0].status === "pending"
                      ? "⏳ Belum Dikumpulkan"
                      : task.penugasan[0].status === "dikirim"
                        ? "📤 Menunggu Penilaian"
                        : task.penugasan[0].status === "selesai"
                          ? "✅ Diterima"
                          : "❌ Ditolak"}
                  </span>
                </div>

                {task.penugasan[0].link_drive && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      Link Pengumpulan
                    </span>
                    <a
                      href={task.penugasan[0].link_drive}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                    >
                      🔗 Lihat File
                    </a>
                  </div>
                )}

                {task.penugasan[0].tanggal_pengumpulan && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      Waktu Pengumpulan
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {new Date(
                        task.penugasan[0].tanggal_pengumpulan
                      ).toLocaleString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                {task.penugasan[0].nilai !== null &&
                  task.penugasan[0].nilai !== undefined && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Nilai Anda
                        </span>
                        <span className="text-3xl font-bold text-gray-900">
                          {task.penugasan[0].nilai}
                          <span className="text-lg text-gray-600">/100</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${task.penugasan[0].nilai}%` }}
                        />
                      </div>
                    </div>
                  )}

                {task.penugasan[0].catatan_guru && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-sm font-semibold text-gray-700 block mb-2">
                      💬 Catatan Guru
                    </span>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                        {task.penugasan[0].catatan_guru}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit form - only show if not submitted yet */}
              {task.penugasan[0].status === "pending" && (
                <>
                  {submitSuccess && (
                    <Alert
                      type="success"
                      message="Tugas berhasil dikumpulkan! Mengalihkan..."
                      className="mb-4"
                    />
                  )}

                  {submitError && (
                    <Alert
                      type="error"
                      message={submitError}
                      onClose={() => setSubmitError("")}
                      className="mb-4"
                    />
                  )}

                  <form onSubmit={handleSubmitTask} className="space-y-4">
                    {task.tipe_pengumpulan === "link" && (
                      <Input
                        label="Link Google Drive"
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        value={linkDrive}
                        onChange={(e) => setLinkDrive(e.target.value)}
                        required
                        disabled={isSubmitting}
                        helperText="Tempelkan link Google Drive Anda di sini"
                      />
                    )}

                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full bg-gray-900 hover:bg-gray-800 shadow-sm"
                    >
                      {task.tipe_pengumpulan === "link"
                        ? "📤 Kirim Tugas"
                        : "✅ Konfirmasi Pengumpulan"}
                    </Button>
                  </form>
                </>
              )}

              {/* Message if already submitted */}
              {task.penugasan[0].status === "dikirim" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      Sedang Dalam Penilaian
                    </p>
                    <p className="text-sm text-blue-700">
                      Tugas Anda sedang dinilai oleh guru. Silakan tunggu.
                    </p>
                  </div>
                </div>
              )}

              {task.penugasan[0].status === "ditolak" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-red-900 mb-1">
                      Tugas Ditolak
                    </p>
                    <p className="text-sm text-red-700">
                      Silakan periksa catatan guru dan kumpulkan ulang.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guru View - Submissions List */}
          {isGuru && task.penugasan.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">👥</span>
                Pengumpulan Siswa ({task.penugasan.length})
              </h2>
              <div className="space-y-4">
                {task.penugasan.map((penugasan) => (
                  <div
                    key={penugasan.id}
                    className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {penugasan.siswa.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <span>🎓</span> {penugasan.siswa.kelas} -{" "}
                          {penugasan.siswa.jurusan}
                        </p>
                        {penugasan.tanggal_pengumpulan && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <span>📅</span>
                            {new Date(
                              penugasan.tanggal_pengumpulan
                            ).toLocaleDateString("id-ID")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                            penugasan.status
                          )}`}
                        >
                          {penugasan.status === "pending"
                            ? "⏳"
                            : penugasan.status === "dikirim"
                              ? "📤"
                              : penugasan.status === "selesai"
                                ? "✅"
                                : "❌"}{" "}
                          {penugasan.status.charAt(0).toUpperCase() +
                            penugasan.status.slice(1)}
                        </span>

                        {penugasan.link_drive && (
                          <a
                            href={penugasan.link_drive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            🔗 Lihat
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Grade Display or Form */}
                    {penugasan.status === "dikirim" &&
                    gradingPenugasanId === penugasan.id ? (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <span>📝</span> Berikan Penilaian
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Status Penilaian
                            </label>
                            <select
                              value={gradeStatus}
                              onChange={(e) =>
                                setGradeStatus(
                                  e.target.value as "selesai" | "ditolak"
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                            >
                              <option value="selesai">✅ Diterima</option>
                              <option value="ditolak">❌ Ditolak</option>
                            </select>
                          </div>

                          {gradeStatus === "selesai" && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nilai (0-100)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={gradeNilai}
                                onChange={(e) => setGradeNilai(e.target.value)}
                                placeholder="Masukkan nilai"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Catatan (Opsional)
                            </label>
                            <textarea
                              value={gradeCatatan}
                              onChange={(e) => setGradeCatatan(e.target.value)}
                              placeholder="Berikan feedback untuk siswa..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleGradeSubmit(penugasan.id)}
                              isLoading={isGrading}
                              className="flex-1 bg-gray-900 hover:bg-gray-800"
                            >
                              💾 Simpan Penilaian
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setGradingPenugasanId(null);
                                setGradeNilai("");
                                setGradeCatatan("");
                                setGradeStatus("selesai");
                              }}
                              disabled={isGrading}
                              className="shadow-sm"
                            >
                              ✖️ Batal
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : penugasan.status === "dikirim" ? (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          size="sm"
                          onClick={() => setGradingPenugasanId(penugasan.id)}
                          className="bg-gray-900 hover:bg-gray-800"
                        >
                          📝 Beri Nilai
                        </Button>
                      </div>
                    ) : null}

                    {(penugasan.nilai !== undefined ||
                      penugasan.catatan_guru) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50/50 rounded-lg p-4">
                        {penugasan.nilai !== undefined && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Nilai:</p>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-gray-900">
                                {penugasan.nilai}
                                <span className="text-base text-gray-600">
                                  /100
                                </span>
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full"
                                  style={{ width: `${penugasan.nilai}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {penugasan.catatan_guru && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              💬 Catatan:
                            </p>
                            <p className="text-sm text-gray-900 bg-white/70 rounded-lg p-3 border border-gray-200">
                              {penugasan.catatan_guru}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
