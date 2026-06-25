import { PermissionGuard } from "@/modules/permission/components/permission-guard";
import { StudentsDashboard } from "@/modules/student/components/students-dashboard";

export default function StudentsPage() {
  return (
    <PermissionGuard subject="students">
      <StudentsDashboard />
    </PermissionGuard>
  );
}
