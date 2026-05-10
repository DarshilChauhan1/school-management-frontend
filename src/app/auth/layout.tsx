import { BrandPanel } from "@/modules/auth/components/brand-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full bg-background">
      <BrandPanel />
      <div className="flex w-full flex-col justify-center bg-card px-6 py-12 sm:px-12 lg:w-[520px] lg:flex-none lg:px-16 xl:w-[560px]">
        <div className="mx-auto w-full max-w-[400px]">{children}</div>
      </div>
    </main>
  );
}
