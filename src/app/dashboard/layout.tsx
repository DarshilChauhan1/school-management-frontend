"use client";

import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  Clock4,
  GraduationCap,
  CircleUser,
  Home,
  KeyRound,
  Layers3,
  LogOut,
  Menu,
  MessageSquare,
  MoreVertical,
  Settings,
  Shield,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useLogout } from "@/modules/auth/api/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import {
  AbilityProvider,
  useAppAbility,
} from "@/modules/permission/ability/ability-context";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  /** CASL subject gating visibility. Omit for always-visible items. */
  subject?: string;
}

interface NavGroup {
  section?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/students", label: "Students", icon: GraduationCap, subject: "students" },
      { href: "/dashboard/staff", label: "Staff", icon: Users, subject: "teachers" },
      { href: "/dashboard/departments", label: "Departments", icon: Building2, subject: "departments" },
      { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen, subject: "subjects" },
      { href: "/dashboard/classes", label: "Classes", icon: Layers3, subject: "classes" },
      { href: "/dashboard/academic-years", label: "Academic years", icon: CalendarDays, subject: "schools" },
      { href: "/dashboard/roles", label: "Roles", icon: Shield, subject: "roles" },
      { href: "/dashboard/permissions", label: "Permissions", icon: KeyRound, subject: "permissions" },
    ],
  },
  {
    section: "Academics",
    items: [
      { href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck, subject: "attendance" },
      { href: "/dashboard/timetable", label: "Timetable", icon: CalendarDays, subject: "timetable" },
      { href: "/dashboard/school-time", label: "School timings", icon: Clock },
      { href: "/dashboard/calendar", label: "School calendar", icon: CalendarDays, subject: "schools" },
    ],
  },
  {
    section: "Operations",
    items: [
      { href: "/dashboard/fees", label: "Fees & finance", icon: Wallet, subject: "fees" },
      { href: "/dashboard/communication", label: "Communication", icon: MessageSquare, subject: "communication" },
    ],
  },
  {
    section: "System",
    items: [
      { href: "/dashboard/profile", label: "My profile", icon: CircleUser },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, subject: "analytics" },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, subject: "schools" },
    ],
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Whole-school snapshot and daily operating signals",
  },
  "/dashboard/students": {
    title: "Students",
    subtitle: "Admit students, manage profiles, enrollment, and guardian contacts",
  },
  "/dashboard/departments": {
    title: "Departments",
    subtitle: "Create academic groups, assign hierarchy, and keep leadership coverage visible",
  },
  "/dashboard/classes": {
    title: "Classes",
    subtitle: "Organise grades and sections for timetable and roster planning",
  },
  "/dashboard/academic-years": {
    title: "Academic years",
    subtitle: "Define the school calendar that scopes classes, timetables, and rosters",
  },
  "/dashboard/subjects": {
    title: "Subjects",
    subtitle: "Curriculum subjects scoped per department, class, or school-wide",
  },
  "/dashboard/calendar": {
    title: "School calendar",
    subtitle: "Plan holidays, exams, PTMs, and events across the academic year",
  },
  "/dashboard/school-time": {
    title: "School timings",
    subtitle:
      "Set daily school hours, assembly, and recess windows per academic year",
  },
  "/dashboard/roles": {
    title: "Roles",
    subtitle: "Define school-scoped roles and the permissions they unlock for staff",
  },
  "/dashboard/permissions": {
    title: "Permissions",
    subtitle: "Assign module-level create, read, update, and delete access per role",
  },
  "/dashboard/profile": {
    title: "My profile",
    subtitle: "Manage your photo, name, and contact details",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const schoolId = useAuthStore((s) => s.user?.schoolId);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const heading = pageTitles[pathname] ?? {
    title: "School Management",
    subtitle: "Module setup is in progress",
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) router.replace("/auth/login");
    else if (!schoolId) router.replace("/onboarding");
  }, [isAuthenticated, isHydrated, router, schoolId]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!mobileNavOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileNavOpen]);

  if (!isHydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !schoolId) return null;

  return (
    <AbilityProvider>
      <DashboardShell
        pathname={pathname}
        heading={heading}
        user={user}
        isPending={isPending}
        onLogout={() => logout()}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      >
        {children}
      </DashboardShell>
    </AbilityProvider>
  );
}

function DashboardShell({
  children,
  pathname,
  heading,
  user,
  isPending,
  onLogout,
  mobileNavOpen,
  setMobileNavOpen,
}: {
  children: React.ReactNode;
  pathname: string;
  heading: { title: string; subtitle: string };
  user: { firstName?: string; lastName?: string; email?: string } | null;
  isPending: boolean;
  onLogout: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}) {
  const renderNav = (onNavigate?: () => void) => (
    <SidebarContent
      pathname={pathname}
      user={user}
      isPending={isPending}
      onLogout={onLogout}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r bg-card lg:flex lg:flex-col">
        {renderNav()}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">Navigation</span>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Close navigation"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex flex-1 flex-col">
              {renderNav(() => setMobileNavOpen(false))}
            </div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-3">
            <Button
              size="icon-sm"
              variant="outline"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold md:text-2xl">
                {heading.title}
              </h1>
              <p className="mt-1 hidden truncate text-sm text-muted-foreground sm:block">
                {heading.subtitle}
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden sm:inline-flex lg:hidden"
              disabled={isPending}
              onClick={onLogout}
            >
              <LogOut className="size-4" />
              <span className="hidden md:inline">Sign out</span>
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  isPending,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  user: { firstName?: string; lastName?: string; email?: string } | null;
  isPending: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const ability = useAppAbility();

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.subject || ability.can("read", item.subject),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">School Management</p>
            <p className="truncate text-xs text-muted-foreground">
              Admin workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {visibleGroups.map((group, groupIndex) => (
            <div key={group.section ?? groupIndex}>
              {group.section ? (
                <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.section}
                </div>
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        active && "bg-accent text-accent-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px]">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/60 p-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-teal-600 text-xs font-semibold text-white">
            {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
              "A"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.firstName
                ? `${user.firstName} ${user.lastName ?? ""}`
                : "Admin"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Account menu"
                  disabled={isPending}
                >
                  <MoreVertical className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={
                  <Link href="/dashboard/profile" onClick={onNavigate} />
                }
              >
                <CircleUser className="size-4" />
                <span>My profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onLogout}>
                <LogOut className="size-4" />
                <span>{isPending ? "Signing out…" : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
