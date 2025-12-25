import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  taskService,
  authService,
  siswaService,
  type RegisterOptions,
  type Siswa,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { MdInfo, MdCheck, MdClose } from "react-icons/md";

export function meta() {
  return [
    { title: "Buat Tugas - Tugas" },
    { name: "description", content: "Buat tugas baru" },
  ];
}

export default function CreateTask() {
  const navigate = useNavigate();
  const { isAuthenticated, isGuru, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    target: "kelas" as "siswa" | "kelas",
    tipe_pengumpulan: "link" as "link" | "langsung",
    tanggal_mulai: "",
    tanggal_deadline: "",
    tampilkan_nilai: false,
  });

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<
    Array<{ kelas: string; jurusan: string }>
  >([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const [options, setOptions] = useState<RegisterOptions | null>(null);
  const [allSiswa, setAllSiswa] = useState<Siswa[]>([]);
  const [availableKelas, setAvailableKelas] = useState<
    Array<{ kelas: string; jurusan: string; jumlah_siswa: number }>
  >([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !isGuru) {
      navigate("/dashboard");
      return;
    }

    const fetchOptions = async () => {
      try {
        const [optionsResponse, siswaResponse, kelasResponse] =
          await Promise.all([
            authService.getRegisterOptions(),
            siswaService.getAllSiswa(),
            siswaService.getKelas(),
          ]);

        if (optionsResponse.berhasil) {
          setOptions(optionsResponse.data);
        } else {
          setError(optionsResponse.pesan || "Gagal load opsi");
        }

        if (siswaResponse.berhasil) {
          // siswaResponse.data sudah berisi array siswa
          setAllSiswa(siswaResponse.data || []);
        }

        if (kelasResponse.berhasil) {
          // kelasResponse.data sudah berisi array kelas
          setAvailableKelas(kelasResponse.data || []);
        } else {
          console.warn("Gagal load kelas:", kelasResponse.pesan);
          setAvailableKelas([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal load opsi");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [isAuthenticated, isGuru, authLoading, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // cek ukuran file (maksimal 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File tidak boleh melebihi 100MB");
        setFile(null);
        setFilePreview("");
        return;
      }

      setFile(selectedFile);

      // buat preview untuk gambar
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview("");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const event = new DataTransfer();
      event.items.add(droppedFile);
      const fileInput = document.querySelector(
        'input[name="file_detail"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.files = event.files;
        handleFileChange({
          target: fileInput,
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleToggleClass = (kelas: string, jurusan: string) => {
    const exists = selectedClasses.some(
      (c) => c.kelas === kelas && c.jurusan === jurusan
    );

    if (exists) {
      setSelectedClasses(
        selectedClasses.filter(
          (c) => !(c.kelas === kelas && c.jurusan === jurusan)
        )
      );
    } else {
      setSelectedClasses([...selectedClasses, { kelas, jurusan }]);
    }
  };

  const isClassSelected = (kelas: string, jurusan: string) => {
    return selectedClasses.some(
      (c) => c.kelas === kelas && c.jurusan === jurusan
    );
  };

  const handleToggleStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const isStudentSelected = (studentId: number) => {
    return selectedStudents.includes(studentId);
  };

  // filter siswa berdasarkan pencarian
  const filteredSiswa = (allSiswa || []).filter((siswa) => {
    if (!studentSearchQuery) return true;
    const query = studentSearchQuery.toLowerCase();
    return (
      siswa.name?.toLowerCase().includes(query) ||
      siswa.username?.toLowerCase().includes(query) ||
      siswa.kelas?.toLowerCase().includes(query) ||
      siswa.jurusan?.toLowerCase().includes(query)
    );
  });

  const validateForm = () => {
    if (!formData.judul.trim()) {
      setError("Judul tugas harus diisi");
      return false;
    }

    if (formData.target === "kelas" && (selectedClasses?.length ?? 0) === 0) {
      setError("Pilih minimal satu kelas");
      return false;
    }

    if (formData.target === "siswa" && (selectedStudents?.length ?? 0) === 0) {
      setError("Pilih minimal satu siswa");
      return false;
    }

    // Warn if selected classes have no students (but don't block submission)
    if (formData.target === "kelas" && (availableKelas?.length ?? 0) > 0) {
      const emptyClasses =
        selectedClasses?.filter((selected) => {
          const found = availableKelas?.find(
            (avail) =>
              avail.kelas?.toUpperCase() === selected.kelas.toUpperCase() &&
              avail.jurusan?.toUpperCase() === selected.jurusan.toUpperCase()
          );
          return found && found.jumlah_siswa === 0;
        }) ?? [];

      if (emptyClasses.length > 0) {
        const classList = emptyClasses
          .map((c) => `${c.kelas} ${c.jurusan}`)
          .join(", ");
        console.warn(
          `Peringatan: Kelas berikut tidak memiliki siswa: ${classList}`
        );
        // Continue anyway - backend will handle validation
      }
    }

    // Validate dates
    if (formData.tanggal_mulai && formData.tanggal_deadline) {
      const mulai = new Date(formData.tanggal_mulai);
      const deadline = new Date(formData.tanggal_deadline);

      if (deadline <= mulai) {
        setError("Tanggal deadline harus setelah tanggal mulai");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Normalize kelas data to uppercase for consistency with backend
      const normalizedIdTarget =
        formData.target === "kelas"
          ? selectedClasses.map((c) => ({
              kelas: c.kelas.toUpperCase().trim(),
              jurusan: c.jurusan.toUpperCase().trim(),
            }))
          : selectedStudents;

      const payload: any = {
        judul: formData.judul,
        target: formData.target,
        id_target: normalizedIdTarget,
        tipe_pengumpulan: formData.tipe_pengumpulan,
        tampilkan_nilai: formData.tampilkan_nilai,
      };

      // tambah field opsional
      if (formData.deskripsi.trim()) {
        payload.deskripsi = formData.deskripsi;
      }

      if (file) {
        payload.file_detail = file;
      }

      if (formData.tanggal_mulai) {
        const startDate = new Date(formData.tanggal_mulai);
        startDate.setHours(0, 0, 0, 0);
        payload.tanggal_mulai = startDate
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }

      if (formData.tanggal_deadline) {
        const endDate = new Date(formData.tanggal_deadline);
        endDate.setHours(23, 59, 59, 999);
        payload.tanggal_deadline = endDate
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }

      const response = await taskService.createTask(payload);

      if (response.berhasil) {
        navigate("/dashboard");
      } else {
        setError(response.pesan || "Gagal membuat tugas");
      }
    } catch (err: any) {
      console.error("Error creating task:", err);

      let errorMessage = "Terjadi kesalahan saat membuat tugas.";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      // ambil detail error dari backend
      if (err.response?.data) {
        const backendError = err.response.data;
        errorMessage = backendError.pesan || errorMessage;

        // log info debug jika ada
        if (backendError.debug) {
          console.error("Backend debug info:", backendError.debug);
        }
      }

      setError(errorMessage);

      // tampilkan pesan bantuan berdasarkan error
      if (
        errorMessage.includes("siswa ditemukan") ||
        errorMessage.includes("tidak ada siswa")
      ) {
        setError(
          errorMessage + " Pastikan ada siswa terdaftar di kelas yang dipilih."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Memuat...</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* tombol kembali */}
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            size="sm"
            className="mb-6"
          >
            ← Kembali ke Daftar Tugas
          </Button>

          {/* kartu form */}
          <Card>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Buat Tugas Baru
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Buat tugas baru dan tugaskan ke siswa
              </p>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* judul tugas */}
              <Input
                label="Judul Tugas"
                type="text"
                name="judul"
                placeholder="contoh: Tugas Matematika Bab 1"
                value={formData.judul}
                onChange={handleChange}
                required
                disabled={isLoading}
              />

              {/* deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  placeholder="Pelajari bab 4 halaman 45-50..."
                  value={formData.deskripsi}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* upload file */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload File (Opsional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Gambar soal, PDF, Word, dll. Maksimal 100MB.
                </p>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <input
                    type="file"
                    name="file_detail"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="hidden"
                    id="file-input"
                    accept="*/*"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    {file ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          Tarik file ke sini atau klik untuk memilih
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Semua format file diperbolehkan
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* preview gambar */}
                {filePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview Gambar
                    </p>
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-xs rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* tombol hapus file */}
                {file && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setFilePreview("");
                      const fileInput = document.querySelector(
                        'input[name="file_detail"]'
                      ) as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                    }}
                    disabled={isLoading}
                    className="mt-2"
                  >
                    Hapus File
                  </Button>
                )}
              </div>

              {/* pilih target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tugaskan Ke
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="kelas"
                      checked={formData.target === "kelas"}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Kelas</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="siswa"
                      checked={formData.target === "siswa"}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Siswa Individual</span>
                  </label>
                </div>
              </div>

              {/* Class Selection */}
              {formData.target === "kelas" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Pilih Kelas ({selectedClasses?.length ?? 0} dipilih)
                  </label>

                  {!options ? (
                    <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                      Memuat opsi kelas...
                    </p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="grid gap-4">
                        {options.kelas?.map((kelas) => {
                          const totalStudents = options.jurusan?.reduce(
                            (sum, jurusan) => {
                              const kelasInfo = availableKelas?.find(
                                (k) =>
                                  k.kelas?.toUpperCase() ===
                                    kelas.toUpperCase() &&
                                  k.jurusan?.toUpperCase() ===
                                    jurusan.toUpperCase()
                              );
                              return sum + (kelasInfo?.jumlah_siswa || 0);
                            },
                            0
                          );

                          return (
                            <div key={kelas}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="font-medium text-gray-900 text-base">
                                  {kelas}
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  Total: {totalStudents} siswa
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 ml-4 mb-3">
                                {options.jurusan?.map((jurusan) => {
                                  const kelasInfo = availableKelas?.find(
                                    (k) =>
                                      k.kelas?.toUpperCase() ===
                                        kelas.toUpperCase() &&
                                      k.jurusan?.toUpperCase() ===
                                        jurusan.toUpperCase()
                                  );
                                  const studentCount =
                                    kelasInfo?.jumlah_siswa || 0;
                                  const hasWarning = studentCount === 0;

                                  return (
                                    <label
                                      key={`${kelas}-${jurusan}`}
                                      className="flex items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 border border-gray-100"
                                      title={
                                        hasWarning
                                          ? "Peringatan: Tidak ada siswa di kelas ini"
                                          : `${studentCount} siswa`
                                      }
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isClassSelected(
                                          kelas,
                                          jurusan
                                        )}
                                        onChange={() =>
                                          handleToggleClass(kelas, jurusan)
                                        }
                                        disabled={isLoading}
                                        className="w-4 h-4 text-gray-900 rounded focus:ring-2 focus:ring-gray-900"
                                      />
                                      <span
                                        className={`flex-1 font-medium ${
                                          hasWarning
                                            ? "text-orange-600"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {jurusan}
                                      </span>
                                      <span
                                        className={`text-xs whitespace-nowrap ${
                                          hasWarning
                                            ? "text-orange-500"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        ({studentCount})
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {(selectedClasses?.length ?? 0) === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Belum ada kelas yang dipilih. Centang kelas yang ingin
                          ditugaskan.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Student Selection */}
              {formData.target === "siswa" && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Pilih Siswa Individual
                    </label>
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {selectedStudents?.length ?? 0} dipilih
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <MdInfo className="w-4 h-4" /> Anda dapat memilih lebih dari
                    satu siswa dengan mencentang beberapa siswa sekaligus
                  </p>

                  {(allSiswa?.length ?? 0) === 0 ? (
                    <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                      Memuat daftar siswa...
                    </p>
                  ) : (
                    <>
                      {/* Search Input and Action Buttons */}
                      <div className="mb-3 space-y-2">
                        <input
                          type="text"
                          placeholder="Cari siswa berdasarkan nama, username, kelas, atau jurusan..."
                          value={studentSearchQuery}
                          onChange={(e) =>
                            setStudentSearchQuery(e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
                        />
                        <div className="flex items-center justify-between">
                          {studentSearchQuery && (
                            <p className="text-xs text-gray-500">
                              Ditemukan {filteredSiswa.length} dari{" "}
                              {allSiswa.length} siswa
                            </p>
                          )}
                          <div className="flex gap-2 ml-auto">
                            <button
                              type="button"
                              onClick={() => {
                                const ids = filteredSiswa.map((s) => s.id);
                                setSelectedStudents(ids);
                              }}
                              disabled={isLoading || filteredSiswa.length === 0}
                              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1"
                            >
                              <MdCheck className="w-3 h-3" /> Pilih Semua
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudents([])}
                              disabled={
                                isLoading || selectedStudents.length === 0
                              }
                              className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-1"
                            >
                              <MdClose className="w-3 h-3" /> Batal Semua
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                        {filteredSiswa.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            Tidak ada siswa yang sesuai dengan pencarian
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {filteredSiswa.map((siswa) => (
                              <label
                                key={siswa.id}
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors border border-gray-100"
                              >
                                <input
                                  type="checkbox"
                                  checked={isStudentSelected(siswa.id)}
                                  onChange={() => handleToggleStudent(siswa.id)}
                                  disabled={isLoading}
                                  className="w-4 h-4 text-gray-900 rounded focus:ring-2 focus:ring-gray-900"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {siswa.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {siswa.kelas} {siswa.jurusan}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                        {(selectedStudents?.length ?? 0) === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4 mt-2">
                            Belum ada siswa yang dipilih. Centang siswa yang
                            ingin ditugaskan.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Submission Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipe Pengumpulan
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tipe_pengumpulan"
                      value="link"
                      checked={formData.tipe_pengumpulan === "link"}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <div>
                      <span className="text-gray-700 font-medium">Online</span>
                      <p className="text-xs text-gray-500">
                        Siswa mengumpulkan via link Google Drive
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="tipe_pengumpulan"
                      value="langsung"
                      checked={formData.tipe_pengumpulan === "langsung"}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <div>
                      <span className="text-gray-700 font-medium">
                        Langsung
                      </span>
                      <p className="text-xs text-gray-500">
                        Siswa mengumpulkan langsung ke Anda (offline)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai (Opsional)
                  </label>
                  <input
                    type="date"
                    name="tanggal_mulai"
                    value={formData.tanggal_mulai}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline (Opsional)
                  </label>
                  <input
                    type="date"
                    name="tanggal_deadline"
                    value={formData.tanggal_deadline}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Show Grades */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="tampilkan_nilai"
                  checked={formData.tampilkan_nilai}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <div>
                  <span className="text-gray-700 font-medium">
                    Tampilkan Nilai ke Siswa
                  </span>
                  <p className="text-xs text-gray-500">
                    Jika tidak dicentang, siswa hanya akan melihat status
                    penyelesaian
                  </p>
                </div>
              </label>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/dashboard")}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  Buat Tugas
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
