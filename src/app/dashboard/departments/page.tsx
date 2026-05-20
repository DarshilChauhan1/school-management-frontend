import { DepartmentsDashboard } from "@/modules/department/components/departments-dashboard";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function DepartmentsPage() {
  return (
    <PermissionGuard subject="departments">
      <DepartmentsDashboard />
    </PermissionGuard>
  );
}
