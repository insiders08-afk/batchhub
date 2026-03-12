import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDemo from "./pages/demo/AdminDemo";
import TeacherDemo from "./pages/demo/TeacherDemo";
import StudentDemo from "./pages/demo/StudentDemo";
import ParentDemo from "./pages/demo/ParentDemo";
import StudentBatchApply from "./pages/StudentBatchApply";
import AdminBatchApplications from "./pages/AdminBatchApplications";
import RoleSelection from "./pages/RoleSelection";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBatches from "./pages/AdminBatches";
import AdminStudents from "./pages/AdminStudents";
import AdminAttendance from "./pages/AdminAttendance";
import AdminFees from "./pages/AdminFees";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminTests from "./pages/AdminTests";
import AdminSettings from "./pages/AdminSettings";
import AdminApprovals from "./pages/AdminApprovals";
import AdminTeam from "./pages/AdminTeam";
import BatchWorkspace from "./pages/BatchWorkspace";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherSettings from "./pages/TeacherSettings";
import StudentSettings from "./pages/StudentSettings";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherAnnouncements from "./pages/TeacherAnnouncements";
import TeacherTests from "./pages/TeacherTests";
import TeacherHomework from "./pages/TeacherHomework";
import StudentDashboard from "./pages/StudentDashboard";
import StudentFees from "./pages/StudentFees";
import StudentAttendance from "./pages/StudentAttendance";
import StudentTests from "./pages/StudentTests";
import StudentHomework from "./pages/StudentHomework";
import StudentAnnouncements from "./pages/StudentAnnouncements";
import ParentDashboard from "./pages/ParentDashboard";
import ParentFees from "./pages/ParentFees";
import AdminAuth from "./pages/auth/AdminAuth";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import TeacherAuth from "./pages/auth/TeacherAuth";
import StudentAuth from "./pages/auth/StudentAuth";
import ParentAuth from "./pages/auth/ParentAuth";
import SuperAdminAuth from "./pages/auth/SuperAdminAuth";
import OwnerAuth from "./pages/auth/OwnerAuth";
import OwnerDashboard from "./pages/OwnerDashboard";
import CityPartnerApply from "./pages/CityPartnerApply";
import Install from "./pages/Install";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/role-select" element={<RoleSelection />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Demo routes — pure fake data, no DB */}
          <Route path="/demo/admin" element={<AdminDemo />} />
          <Route path="/demo/teacher" element={<TeacherDemo />} />
          <Route path="/demo/student" element={<StudentDemo />} />
          <Route path="/demo/parent" element={<ParentDemo />} />
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/batches" element={<AdminBatches />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/fees" element={<AdminFees />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/tests" element={<AdminTests />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/team" element={<AdminTeam />} />
          <Route path="/admin/batch-applications" element={<AdminBatchApplications />} />
          <Route path="/auth/admin" element={<AdminAuth />} />
          <Route path="/auth/superadmin" element={<SuperAdminAuth />} />
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          <Route path="/auth/teacher" element={<TeacherAuth />} />
          <Route path="/auth/student" element={<StudentAuth />} />
          <Route path="/auth/parent" element={<ParentAuth />} />
          <Route path="/auth/owner" element={<OwnerAuth />} />
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/apply/city-partner" element={<CityPartnerApply />} />
          <Route path="/install" element={<Install />} />
          <Route path="/batch/:id" element={<BatchWorkspace />} />
          {/* Teacher */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/settings" element={<TeacherSettings />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/announcements" element={<TeacherAnnouncements />} />
          <Route path="/teacher/tests" element={<TeacherTests />} />
          <Route path="/teacher/homework" element={<TeacherHomework />} />
          {/* Student */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/settings" element={<StudentSettings />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/tests" element={<StudentTests />} />
          <Route path="/student/homework" element={<StudentHomework />} />
          <Route path="/student/announcements" element={<StudentAnnouncements />} />
          <Route path="/student/apply-batch" element={<StudentBatchApply />} />
          <Route path="/student/fees" element={<StudentFees />} />
          {/* Parent */}
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/fees" element={<ParentFees />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
