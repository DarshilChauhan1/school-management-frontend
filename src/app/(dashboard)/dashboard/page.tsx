"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/modules/auth/api/use-auth";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{user?.email}</span>.
        </p>
      </div>
      <Button onClick={() => logout()} disabled={isPending} variant="outline">
        {isPending ? "Signing out…" : "Sign out"}
      </Button>
    </div>
  );
}
