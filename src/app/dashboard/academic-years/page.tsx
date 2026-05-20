import { AcademicYearsDashboard } from "@/modules/academic-year/components/academic-years-dashboard";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function AcademicYearsPage() {
  return (
    <PermissionGuard subject="schools">
      <AcademicYearsDashboard />
    </PermissionGuard>
  );
}
