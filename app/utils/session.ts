export interface sessionErrorState {
  isExpired: boolean;
  isInvalid: boolean;
  requiresRelogin: boolean;
  message: string;
}

export function isSessionExpired(error: any): boolean {
  if (error?.kode === "TOKEN_EXPIRED") return true;
  if (error?.pesan?.includes("kadaluarsa") || error?.pesan?.includes("expired"))
    return true;
  return false;
}

export function isSessionInvalid(error: any): boolean {
  if (error?.kode === "TOKEN_INVALID") return true;
  if (error?.kode === "TOKEN_NOT_FOUND") return true;
  if (
    error?.pesan?.includes("tidak valid") ||
    error?.pesan?.includes("tidak ditemukan")
  )
    return true;
  return false;
}

export function isInvalidServerResponse(error: any): boolean {
  if (error?.message?.includes("non-json response")) return true;
  if (error?.message?.includes("invalid response from server")) return true;
  return false;
}

export function getSessionErrorState(error: any): sessionErrorState {
  return {
    isExpired: isSessionExpired(error),
    isInvalid: isSessionInvalid(error),
    requiresRelogin: isSessionExpired(error) || isSessionInvalid(error),
    message:
      error?.message || error?.pesan || "terjadi kesalahan. silakan coba lagi.",
  };
}

export function getUserFriendlyErrorMessage(error: any): string {
  const state = getSessionErrorState(error);

  if (state.isExpired) {
    return "session anda telah berakhir. silakan login kembali.";
  }

  if (state.isInvalid) {
    return "authentikasi gagal. silakan login kembali.";
  }

  if (isInvalidServerResponse(error)) {
    return "koneksi server terputus. silakan refresh halaman dan login kembali.";
  }

  return (
    error?.pesan || error?.message || "terjadi kesalahan. silakan coba lagi."
  );
}

export function handleSessionError(error: any): void {
  const state = getSessionErrorState(error);

  if (state.requiresRelogin) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.dispatchEvent(
        new CustomEvent("session-expired", {
          detail: {
            kode: state.isExpired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
            pesan: state.message,
          },
        })
      );
    }
  }
}
