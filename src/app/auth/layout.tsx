import { BrandPanel } from "@/modules/auth/components/brand-panel";
import { Layers } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <section className="flex min-h-screen flex-col bg-card">
        <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Layers className="size-4" />
            </div>
            <span className="font-display font-semibold">Campus OS</span>
          </div>
        </div>

        <div className="grid flex-1 place-items-center px-6 py-12 lg:p-16">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <div className="flex items-center justify-between px-6 pb-6 text-xs text-muted-foreground lg:px-16 lg:pb-8">
          <span>© {new Date().getFullYear()} Campus OS</span>
          <span className="hidden sm:inline">Need help? support@campus.os</span>
        </div>
      </section>
    </main>
  );
}
