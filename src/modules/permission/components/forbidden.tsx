import { ShieldX } from "lucide-react";

export function Forbidden({
  message = "Permissions not granted",
  hint = "You don't have access to this section. Contact your school administrator if you think this is a mistake.",
}: {
  message?: string;
  hint?: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-rose-100 text-rose-600">
          <ShieldX className="size-7" />
        </div>
        <h2 className="text-lg font-semibold">Forbidden</h2>
        <p className="mt-1 text-sm font-medium text-rose-600">{message}</p>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
