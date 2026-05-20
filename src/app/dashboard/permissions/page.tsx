import { PermissionsManager } from "@/modules/permission/components/permissions-manager";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function PermissionsPage() {
  return (
    <PermissionGuard subject="rbpac">
      <PermissionsManager />
    </PermissionGuard>
  );
}
