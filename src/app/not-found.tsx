import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-lg bg-muted text-2xl font-semibold">
          404
        </div>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <Link href="/" className={buttonVariants()}>
            <Home className="size-4" />
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
