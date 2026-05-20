import { ClassesDashboard } from "@/modules/class/components/classes-dashboard";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function ClassesPage() {
  return (
    <PermissionGuard subject="classes">
      <ClassesDashboard />
    </PermissionGuard>
  );
}
