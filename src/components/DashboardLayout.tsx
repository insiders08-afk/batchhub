import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CalendarCheck, Megaphone,
  FlaskConical, IndianRupee, GraduationCap, Settings,
  LogOut, Zap, ChevronLeft, Menu, X, ShieldCheck,
  BookOpen, Trophy, ClipboardList, UserCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Role = "admin" | "teacher" | "student" | "parent";

const menusByRole: Record<Role, { icon: React.ElementType; label: string; path: string }[]> = {
  admin: [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Users, label: "Batches", path: "/admin/batches" },
    { icon: CalendarCheck, label: "Attendance", path: "/admin/attendance" },
    { icon: Megaphone, label: "Announcements", path: "/admin/announcements" },
    { icon: FlaskConical, label: "Tests", path: "/admin/tests" },
    { icon: IndianRupee, label: "Fees", path: "/admin/fees" },
    { icon: GraduationCap, label: "Students", path: "/admin/students" },
    { icon: ShieldCheck, label: "Approvals", path: "/admin/approvals" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "My Dashboard", path: "/teacher" },
    { icon: Users, label: "My Batches", path: "/teacher" },
    { icon: CalendarCheck, label: "Attendance", path: "/teacher" },
    { icon: Megaphone, label: "Announcements", path: "/teacher" },
    { icon: FlaskConical, label: "Tests", path: "/teacher" },
    { icon: BookOpen, label: "Homework / DPP", path: "/teacher" },
    { icon: Settings, label: "Settings", path: "/teacher" },
  ],
  student: [
    { icon: LayoutDashboard, label: "My Dashboard", path: "/student" },
    { icon: Users, label: "My Batch", path: "/student" },
    { icon: Trophy, label: "Tests & Scores", path: "/student" },
    { icon: BookOpen, label: "Homework / DPP", path: "/student" },
    { icon: Megaphone, label: "Announcements", path: "/student" },
    { icon: Settings, label: "Settings", path: "/student" },
  ],
  parent: [
    { icon: LayoutDashboard, label: "Overview", path: "/parent" },
    { icon: UserCircle, label: "My Child", path: "/parent" },
    { icon: CalendarCheck, label: "Attendance", path: "/parent" },
    { icon: IndianRupee, label: "Fees", path: "/parent" },
    { icon: Megaphone, label: "Announcements", path: "/parent" },
  ],
};

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

const roleAvatars: Record<Role, string> = {
  admin: "RK",
  teacher: "AG",
  student: "AS",
  parent: "SS",
};

const roleNames: Record<Role, string> = {
  admin: "Rajesh Kumar",
  teacher: "Amit Gupta",
  student: "Arjun Sharma",
  parent: "Sunita Sharma",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  role?: Role;
}

export default function DashboardLayout({ children, title, role = "admin" }: DashboardLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const menuItems = menusByRole[role];
  const isAdmin = role === "admin";

  useEffect(() => {
    if (isAdmin) {
      const stored = JSON.parse(localStorage.getItem("lamba_pending_requests") || "[]");
      const pending = stored.filter((r: { status: string }) => r.status === "pending").length;
      setPendingCount(pending + 4);
    }
  }, [isAdmin]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-display font-bold text-white">Lamba</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent w-8 h-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Institute Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 mb-1 p-2.5 rounded-lg bg-sidebar-accent border border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 font-medium">Institute</p>
          <p className="text-sm font-semibold text-sidebar-foreground truncate">Apex Classes, Kota</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const active = location.pathname === item.path && (
            isAdmin ? location.pathname === item.path : idx === 0
          );
          const isActiveItem = isAdmin
            ? location.pathname === item.path
            : location.pathname === item.path && idx === 0;
          return (
            <Link
              key={`${item.path}-${item.label}`}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActiveItem
                  ? "bg-sidebar-primary text-white shadow-primary/30 shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", isActiveItem ? "text-white" : "")} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && isAdmin && item.path === "/admin/approvals" && pendingCount > 0 && (
                <span className="text-xs font-bold bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 border-t border-sidebar-border pt-4">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
              {roleAvatars[role]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{roleNames[role]}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</p>
            </div>
          </div>
        )}
        <Link to="/">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar flex-shrink-0 transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50 lg:hidden transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border/50 bg-card flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            {title && <h1 className="font-display font-semibold text-lg">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live
            </div>
            <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
              {roleAvatars[role]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
