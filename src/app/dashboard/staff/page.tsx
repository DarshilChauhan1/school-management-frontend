import { StaffDashboard } from "@/modules/staff/components/staff-dashboard";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function StaffPage() {
  return (
    <PermissionGuard subject="teachers">
      <StaffDashboard />
    </PermissionGuard>
  );
}
