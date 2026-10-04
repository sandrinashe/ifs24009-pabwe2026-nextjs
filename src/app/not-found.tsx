import Link from "next/link";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-100/50 to-amber-100/40 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-xl shadow-amber-500/10 border border-amber-200/60 text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 items-center justify-center mb-6 shadow-sm border border-amber-200">
          <IconAlertTriangle size={36} stroke={2.2} />
        </div>

        <div>
          <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full uppercase tracking-wider mb-3 border border-amber-200">
            Error 404
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          Maaf, halaman atau rute yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
        >
          <IconArrowLeft size={18} stroke={2.5} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
