import { SubjectsDashboard } from "@/modules/subject/components/subjects-dashboard";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function SubjectsPage() {
  return (
    <PermissionGuard subject="subjects">
      <SubjectsDashboard />
    </PermissionGuard>
  );
}
