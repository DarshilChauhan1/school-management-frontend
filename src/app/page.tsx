"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const schoolId = useAuthStore((s) => s.user?.schoolId);

  useEffect(() => {
    router.replace(isAuthenticated ? (schoolId ? "/dashboard" : "/onboarding") : "/auth/login");
  }, [isAuthenticated, router, schoolId]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
