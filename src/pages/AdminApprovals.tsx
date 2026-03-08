import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, XCircle, Clock, BookOpen, GraduationCap,
  UserCircle, Search, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type PendingRequest = Tables<"pending_requests">;

const roleConfig = {
  teacher: { icon: BookOpen, gradient: "from-success to-emerald-400", label: "Teacher", bg: "bg-success-light", text: "text-success" },
  student: { icon: GraduationCap, gradient: "from-accent to-orange-400", label: "Student", bg: "bg-accent-light", text: "text-accent" },
  parent: { icon: UserCircle, gradient: "from-violet-500 to-purple-600", label: "Parent", bg: "bg-violet-100", text: "text-violet-600" },
  admin: { icon: CheckCircle2, gradient: "from-primary to-primary", label: "Admin", bg: "bg-primary-light", text: "text-primary" },
  super_admin: { icon: CheckCircle2, gradient: "from-primary to-primary", label: "Super Admin", bg: "bg-primary-light", text: "text-primary" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${m}m ago`;
}

export default function AdminApprovals() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pending_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load requests";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (req: PendingRequest, action: "approved" | "rejected") => {
    setActionLoading(req.id);
    try {
      // 1. Update pending_request status
      const { error: reqError } = await supabase
        .from("pending_requests")
        .update({ status: action, reviewed_by: (await supabase.auth.getUser()).data.user?.id })
        .eq("id", req.id);
      if (reqError) throw reqError;

      if (action === "approved") {
        // 2. Update profile status
        const { error: profError } = await supabase
          .from("profiles")
          .update({ status: "approved" })
          .eq("user_id", req.user_id);
        if (profError) throw profError;

        // 3. Insert into user_roles
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({
            user_id: req.user_id,
            role: req.role,
            institute_code: req.institute_code,
          }, { onConflict: "user_id,role" });
        if (roleError) throw roleError;

        toast({ title: "Approved!", description: `${req.full_name} has been granted ${req.role} access.` });
      } else {
        // Update profile to rejected
        await supabase.from("profiles").update({ status: "rejected" }).eq("user_id", req.user_id);
        toast({ title: "Rejected", description: `${req.full_name}'s request has been rejected.` });
      }

      // Refresh list
      setRequests((prev) =>
        prev.map((r) => r.id === req.id ? { ...r, status: action } : r)
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Action failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch =
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.institute_code.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const teacherPending = requests.filter((r) => r.role === "teacher" && r.status === "pending").length;
  const studentPending = requests.filter((r) => r.role === "student" && r.status === "pending").length;
  const parentPending = requests.filter((r) => r.role === "parent" && r.status === "pending").length;

  return (
    <DashboardLayout title="Approval Requests">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-muted-foreground text-sm">Review and approve teacher, student, and parent access requests.</p>
          {pendingCount > 0 && (
            <Badge className="bg-danger-light text-danger border-danger/20 text-sm px-3 py-1">
              {pendingCount} pending approval{pendingCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or institute ID..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? "gradient-hero text-white border-0" : ""}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== "all" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({requests.filter((r) => r.status === f).length})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {([
            { role: "teacher", count: teacherPending, cfg: roleConfig.teacher },
            { role: "student", count: studentPending, cfg: roleConfig.student },
            { role: "parent", count: parentPending, cfg: roleConfig.parent },
          ]).map(({ role, count, cfg }) => (
            <Card key={role} className="p-4 shadow-card border-border/50 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
                <cfg.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold capitalize">{role}s</p>
                <p className="text-xs text-muted-foreground">{count} pending</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Request list */}
        <div className="space-y-3">
          {loading ? (
            <Card className="p-10 text-center shadow-card border-border/50">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading requests...</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center shadow-card border-border/50">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
              <p className="font-semibold">All caught up!</p>
              <p className="text-muted-foreground text-sm">No {filter === "all" ? "" : filter} requests found.</p>
            </Card>
          ) : (
            filtered.map((req, i) => {
              const role = req.role as keyof typeof roleConfig;
              const cfg = roleConfig[role] || roleConfig.teacher;
              const extra = (req.extra_data as Record<string, string>) || {};
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="p-4 shadow-card border-border/50 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
                        <cfg.icon className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{req.full_name}</span>
                          <Badge className={`text-xs ${cfg.bg} ${cfg.text} border-0`}>{cfg.label}</Badge>
                          {req.status === "pending" && (
                            <Badge className="text-xs bg-accent-light text-accent border-0 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> Pending
                            </Badge>
                          )}
                          {req.status === "approved" && (
                            <Badge className="text-xs bg-success-light text-success border-0 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                            </Badge>
                          )}
                          {req.status === "rejected" && (
                            <Badge className="text-xs bg-danger-light text-danger border-0 flex items-center gap-1">
                              <XCircle className="w-2.5 h-2.5" /> Rejected
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Institute: <strong className="text-foreground">{req.institute_code}</strong></span>
                          <span>Email: <strong className="text-foreground">{req.email}</strong></span>
                          {extra.teacherId && <span>Teacher ID: <strong className="text-foreground">{extra.teacherId}</strong></span>}
                          {extra.studentId && <span>Student ID: <strong className="text-foreground">{extra.studentId}</strong></span>}
                          {extra.subject && <span>Subject: <strong className="text-foreground">{extra.subject}</strong></span>}
                          {extra.batchName && <span>Batch: <strong className="text-foreground">{extra.batchName}</strong></span>}
                          {extra.relation && <span>Relation: <strong className="text-foreground">{extra.relation}</strong></span>}
                          {extra.phone && <span>Phone: <strong className="text-foreground">{extra.phone}</strong></span>}
                          <span className="text-muted-foreground/60">{timeAgo(req.created_at)}</span>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            disabled={actionLoading === req.id}
                            className="bg-success-light text-success hover:bg-success hover:text-white border border-success/20 h-8 text-xs gap-1 transition-colors"
                            onClick={() => handleAction(req, "approved")}
                          >
                            {actionLoading === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading === req.id}
                            className="text-danger border-danger/30 hover:bg-danger-light h-8 text-xs gap-1"
                            onClick={() => handleAction(req, "rejected")}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
