import { RolesDashboard } from "@/modules/role/components/roles-dashboard";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function RolesPage() {
  return (
    <PermissionGuard subject="roles">
      <RolesDashboard />
    </PermissionGuard>
  );
}
