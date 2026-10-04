"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiHelper from "../../../helpers/apiHelper";
import { asyncSetProfile, setIsProfile } from "../../users/states/action";
import { asyncSetIsAuthLogout, setIsAuthLogoutActionCreator } from "../../auth/states/action";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

function PostLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const profile = useAppSelector((state) => state.profile);
  const isProfile = useAppSelector((state) => state.isProfile);
  const isAuthLogout = useAppSelector((state) => state.isAuthLogout);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const authToken = apiHelper.getAccessToken();
    if (authToken) {
      dispatch(asyncSetProfile());
    } else {
      router.push("/auth/login");
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (isProfile) {
      dispatch(setIsProfile(false));
      if (!profile) {
        apiHelper.putAccessToken("");
        router.push("/auth/login");
      }
    }
  }, [isProfile, profile, dispatch, router]);

  useEffect(() => {
    if (isAuthLogout) {
      dispatch(setIsAuthLogoutActionCreator(false));
      router.push("/auth/login");
    }
  }, [isAuthLogout, dispatch, router]);

  function handleLogout() {
    dispatch(asyncSetIsAuthLogout());
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat sesi pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <NavbarComponent
        profile={profile}
        handleLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <Suspense fallback={null}>
        <SidebarComponent
          isSidebarOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
      </Suspense>

      <main className="pt-16 md:pl-64 transition-all">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default PostLayout;
