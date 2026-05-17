import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <section className="grid min-h-[65vh] place-items-center">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-lg bg-muted text-2xl font-semibold">
          404
        </div>
        <h2 className="text-2xl font-semibold">Dashboard page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This dashboard module is not available yet. Check the URL or return to a working module.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <Link href="/dashboard/departments" className={buttonVariants()}>
            <Building2 className="size-4" />
            Departments
          </Link>
        </div>
      </div>
    </section>
  );
}
