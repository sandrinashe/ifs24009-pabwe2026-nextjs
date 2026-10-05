const loadSwal = () => import("sweetalert2").then((module) => module.default);

export function showErrorDialog(message) {
  return loadSwal().then((Swal) => Swal.fire({
    title: "Terjadi Kesalahan",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#ef4444",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  }));
}

export function showWarningDialog(message) {
  return loadSwal().then((Swal) => Swal.fire({
    title: "Peringatan",
    text: message,
    icon: "warning",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#f59e0b",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  }));
}

export function showSuccessDialog(message) {
  return loadSwal().then((Swal) => Swal.fire({
    title: "Tindakan Berhasil",
    text: message,
    icon: "success",
    confirmButtonText: "Tutup",
    confirmButtonColor: "#10b981",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
    }
    return result;
  }));
}

export function showConfirmDialog(message) {
  return loadSwal().then((Swal) => Swal.fire({
    title: "Konfirmasi",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#94a3b8",
  }));
}

export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
