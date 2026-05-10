"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const schoolId = useAuthStore((s) => s.user?.schoolId);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/auth/login");
    else if (!schoolId) router.replace("/onboarding");
  }, [isAuthenticated, router, schoolId]);

  if (!isAuthenticated || !schoolId) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">School Management</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
