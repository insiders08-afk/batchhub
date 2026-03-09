import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CalendarCheck, Megaphone,
  FlaskConical, IndianRupee, GraduationCap, Settings,
  LogOut, Zap, ChevronLeft, Menu, X, ShieldCheck,
  BookOpen, Trophy, ClipboardList, UserCircle, BookMarked, PlusCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
    { icon: ClipboardList, label: "Team", path: "/admin/team" },
    { icon: ShieldCheck, label: "Approvals", path: "/admin/approvals" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "My Dashboard", path: "/teacher" },
    { icon: CalendarCheck, label: "Attendance", path: "/teacher/attendance" },
    { icon: Megaphone, label: "Announcements", path: "/teacher/announcements" },
    { icon: FlaskConical, label: "Tests & Scores", path: "/teacher/tests" },
    { icon: BookOpen, label: "Homework / DPP", path: "/teacher/homework" },
  ],
  student: [
    { icon: LayoutDashboard, label: "My Dashboard", path: "/student" },
    { icon: CalendarCheck, label: "My Attendance", path: "/student/attendance" },
    { icon: Trophy, label: "Tests & Scores", path: "/student/tests" },
    { icon: BookOpen, label: "Homework / DPP", path: "/student/homework" },
    { icon: Megaphone, label: "Announcements", path: "/student/announcements" },
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

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  role?: Role;
}

export default function DashboardLayout({ children, title, role = "admin" }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [userName, setUserName] = useState("Loading...");
  const [userInitials, setUserInitials] = useState("...");
  const [instituteName, setInstituteName] = useState("");

  const menuItems = menusByRole[role];
  const isAdmin = role === "admin";

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, institute_code")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || user.email || "User");
        const parts = (profile.full_name || "U").split(" ");
        setUserInitials(parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2));

        if (profile.institute_code) {
          const { data: institute } = await supabase
            .from("institutes")
            .select("institute_name, city")
            .eq("institute_code", profile.institute_code)
            .single();
          if (institute) {
            setInstituteName(`${institute.institute_name}${institute.city ? ", " + institute.city : ""}`);
          } else {
            setInstituteName(profile.institute_code);
          }
        }
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const fetchPending = async () => {
        const { data } = await supabase
          .from("pending_requests")
          .select("id")
          .eq("status", "pending");
        setPendingCount(data?.length || 0);
      };
      fetchPending();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Determine active state: for non-admin, only exact match on the current path
  const isActiveItem = (itemPath: string) => {
    if (role === "admin") {
      return location.pathname === itemPath;
    }
    // For teacher/student: exact match
    return location.pathname === itemPath;
  };

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
          <p className="text-sm font-semibold text-sidebar-foreground truncate">
            {instituteName || "Loading..."}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActiveItem(item.path);
          return (
            <Link
              key={`${item.path}-${item.label}`}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-sidebar-primary text-white shadow-primary/30 shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "")} />
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
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{userName}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent w-full transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
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
              {userInitials}
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
