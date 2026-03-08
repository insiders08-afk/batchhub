import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
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
import BatchWorkspace from "./pages/BatchWorkspace";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import AdminAuth from "./pages/auth/AdminAuth";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import TeacherAuth from "./pages/auth/TeacherAuth";
import StudentAuth from "./pages/auth/StudentAuth";
import ParentAuth from "./pages/auth/ParentAuth";

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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/batches" element={<AdminBatches />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/fees" element={<AdminFees />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/tests" element={<AdminTests />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/auth/admin" element={<AdminAuth />} />
          <Route path="/auth/teacher" element={<TeacherAuth />} />
          <Route path="/auth/student" element={<StudentAuth />} />
          <Route path="/auth/parent" element={<ParentAuth />} />
          <Route path="/batch/:id" element={<BatchWorkspace />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
