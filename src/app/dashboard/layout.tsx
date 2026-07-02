"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Clock,
  CircleUser,
  KeyRound,
  Layers,
  Layers3,
  LogOut,
  Menu,
  MessageSquare,
  MoreVertical,
  Search,
  Settings,
  Shield,
  Sparkles,
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
      { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/dashboard/students", label: "Students", icon: Users, subject: "students" },
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

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard Overview",
  students: "Student Registry",
  staff: "Staff Directory",
  departments: "Departments",
  subjects: "Subjects",
  classes: "Classes",
  "academic-years": "Academic Years",
  roles: "Roles",
  permissions: "Permissions",
  attendance: "Attendance",
  timetable: "Timetable",
  "school-time": "School Timings",
  calendar: "School Calendar",
  fees: "Financials",
  communication: "Communication",
  profile: "My Profile",
  analytics: "Analytics",
  settings: "Settings",
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
    <div className="grid min-h-screen bg-paper text-foreground lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
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
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
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
        <AppHeader
          pathname={pathname}
          heading={heading}
          user={user}
          isPending={isPending}
          onLogout={onLogout}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function AppHeader({
  pathname,
  heading,
  user,
  isPending,
  onLogout,
  onOpenMobileNav,
}: {
  pathname: string;
  heading: { title: string; subtitle: string };
  user: { firstName?: string; lastName?: string; email?: string } | null;
  isPending: boolean;
  onLogout: () => void;
  onOpenMobileNav: () => void;
}) {
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 h-auto shrink-0 border-b border-border/60 bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/65">
      <div className="flex min-h-20 items-center gap-4 px-4 py-3 md:px-6 lg:px-10">
        <Button
          size="icon-sm"
          variant="ghost"
          className="-ml-1 text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
        >
          <Menu className="size-4" />
        </Button>

        <div className="hidden min-w-0 flex-1 md:block">
          <RouteBreadcrumbs pathname={pathname} heading={heading} />
        </div>

        <div className="min-w-0 flex-1 md:hidden">
          <p className="truncate text-sm font-semibold">{heading.title}</p>
          <p className="truncate text-xs text-muted-foreground">{heading.subtitle}</p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <AskAiSearchPanel />
          <NotificationsMenu />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full border border-border/70 bg-card text-[11px] font-medium italic text-foreground/80 transition hover:border-primary/40 hover:text-primary"
                  aria-label="Open account menu"
                  disabled={isPending}
                />
              }
            >
              {initials}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
              <div className="px-2.5 py-2">
                <p className="truncate text-sm font-semibold">
                  {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}` : "Admin"}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                <CircleUser className="size-4" />
                <span>My profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onLogout}>
                <LogOut className="size-4" />
                <span>{isPending ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function RouteBreadcrumbs({
  pathname,
  heading,
}: {
  pathname: string;
  heading: { title: string; subtitle: string };
}) {
  const parts = pathname.split("/").filter(Boolean);

  return (
    <div className="min-w-0">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80"
      >
        <Link href="/dashboard" className="shrink-0 transition hover:text-primary">
          Institution
        </Link>
        {parts.map((segment, index) => {
          const href = `/${parts.slice(0, index + 1).join("/")}`;
          const isLast = index === parts.length - 1;
          const label =
            breadcrumbLabels[segment] ??
            segment
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" ");

          return (
            <span key={href} className="flex min-w-0 items-center gap-2">
              <span className="text-muted-foreground/40">/</span>
              {isLast ? (
                <span className="truncate font-medium tracking-[0.18em] text-foreground">
                  {label}
                </span>
              ) : (
                <Link href={href} className="truncate transition hover:text-primary">
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
      <p className="mt-1 hidden truncate text-xs text-muted-foreground xl:block">
        {heading.subtitle}
      </p>
    </div>
  );
}

function AskAiSearchPanel() {
  const quickPrompts = [
    "Find inactive students",
    "Today attendance summary",
    "Pending guardian contacts",
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="group flex size-10 items-center justify-center rounded-full border border-border/70 bg-transparent text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary lg:h-10 lg:w-72 lg:justify-start lg:gap-2 lg:rounded-none lg:px-3 lg:text-left lg:hover:text-foreground"
            aria-label="Open Ask AI search"
          />
        }
      >
        <Search className="hidden size-4 text-muted-foreground/70 transition group-hover:text-primary lg:block" />
        <span className="hidden min-w-0 flex-1 truncate lg:block">Ask AI or search records...</span>
        <Sparkles className="size-4 text-gold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(92vw,420px)] rounded-2xl p-0">
        <div className="border-b border-border bg-card px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Ask AI</p>
              <p className="text-xs text-muted-foreground">Search records, actions, and school signals.</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 bg-background p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Ask about students, attendance, fees..."
              className="h-11 w-full rounded-xl border border-transparent bg-paper-2/70 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Quick prompts
            </p>
            <div className="grid gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm transition hover:border-primary/40 hover:text-primary"
                >
                  <span>{prompt}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationsMenu() {
  const notifications = [
    {
      title: "Attendance sync complete",
      detail: "Daily attendance registers are ready for review.",
      time: "2m",
    },
    {
      title: "New admission draft",
      detail: "One student profile is waiting for guardian details.",
      time: "18m",
    },
    {
      title: "Fee reminder queue",
      detail: "12 reminders are scheduled for this afternoon.",
      time: "1h",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-full border border-border/70 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            aria-label="Open notifications"
          />
        }
      >
        <Bell className="size-4" />
        <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-gold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(92vw,360px)] rounded-2xl p-0">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-4">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">Recent school activity</p>
          </div>
          <span className="rounded-full bg-primary-soft px-2 py-1 text-[11px] font-semibold text-primary">
            3 new
          </span>
        </div>
        <div className="bg-background p-2">
          {notifications.map((item) => (
            <button
              key={item.title}
              type="button"
              className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-paper-2"
            >
              <span className="mt-1 size-2 rounded-full bg-gold" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {item.detail}
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground">{item.time}</span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
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
      <div className="border-b border-sidebar-border/60 px-6 py-7">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-1">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-emerald">
            <Layers className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display truncate text-base font-semibold leading-tight text-sidebar-foreground">
              Campus OS
            </p>
            <p className="mt-1 truncate text-[10px] font-medium uppercase text-sidebar-foreground/50">
              School portal
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-7">
          {visibleGroups.map((group, groupIndex) => (
            <div key={group.section ?? groupIndex}>
              {group.section ? (
                <div className="mb-2 px-3 text-[10px] font-semibold uppercase text-sidebar-foreground/40">
                  {group.section}
                </div>
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex h-10 items-center gap-3 overflow-hidden rounded-lg px-3 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
                        active &&
                          "bg-primary-soft text-primary hover:bg-primary-soft hover:text-primary",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full bg-primary"
                        />
                      ) : null}
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0 transition-opacity",
                          active ? "opacity-100" : "opacity-55 group-hover:opacity-100",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                          {item.badge}
                        </span>
                      ) : active ? (
                        <span aria-hidden className="size-1.5 rounded-full bg-gold" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/60 px-4 py-4">
          <span className="relative shrink-0">
            <span className="grid size-10 place-items-center rounded-full border-2 border-sidebar bg-primary text-xs font-bold text-primary-foreground">
              {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
                "A"}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-sidebar bg-emerald-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-none text-sidebar-foreground">
              {user?.firstName
                ? `${user.firstName} ${user.lastName ?? ""}`
                : "Admin"}
            </p>
            <p className="mt-1.5 truncate text-[11px] font-medium text-sidebar-foreground/60">
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
