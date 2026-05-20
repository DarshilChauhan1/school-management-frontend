import { CalendarDashboard } from "@/modules/calendar/components/calendar-dashboard";
import { PermissionGuard } from "@/modules/permission/components/permission-guard";

export default function CalendarPage() {
  return (
    <PermissionGuard subject="schools">
      <CalendarDashboard />
    </PermissionGuard>
  );
}
