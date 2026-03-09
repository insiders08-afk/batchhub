import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, XCircle, Clock, BookOpen, GraduationCap,
  UserCircle, Search, Loader2, RotateCcw, Link2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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

  // Parent-child link dialog state
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; req: PendingRequest | null }>({ open: false, req: null });
  const [studentProfiles, setStudentProfiles] = useState<{ user_id: string; full_name: string; email: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const fetchRequests = useCallback(async () => {
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
  }, [toast]);

  // Auto-repair: backfill any approved profiles missing a user_roles row
  const repairMissingRoles = useCallback(async () => {
    try {
      // Get all approved profiles in this admin's institute
      const { data: approved } = await supabase
        .from("profiles")
        .select("user_id, role, institute_code")
        .in("status", ["approved", "active"])
        .not("institute_code", "is", null);

      if (!approved || approved.length === 0) return;

      // Get existing user_roles
      const { data: existingRoles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const existingSet = new Set(
        (existingRoles || []).map((r) => `${r.user_id}::${r.role}`)
      );

      const missing = approved.filter(
        (p) => !existingSet.has(`${p.user_id}::${p.role}`)
      );

      if (missing.length === 0) return;

      // Silently backfill
      await supabase.from("user_roles").insert(
        missing.map((p) => ({
          user_id: p.user_id,
          role: p.role,
          institute_code: p.institute_code,
        }))
      );

      console.log(`Auto-repaired ${missing.length} missing user_roles entries`);
    } catch (err) {
      // Non-critical repair — don't surface to user
      console.warn("Auto-repair warning:", err);
    }
  }, []);

  // Initial fetch + Realtime subscription for live updates
  useEffect(() => {
    repairMissingRoles();
    fetchRequests();

    const channel = supabase
      .channel("admin-approvals-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "pending_requests",
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests, repairMissingRoles]);

  const handleAction = async (req: PendingRequest, action: "approved" | "rejected") => {
    // For parent approval, open the child-link dialog first
    if (action === "approved" && req.role === "parent") {
      // Fetch approved students in this institute
      const { data: students } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("institute_code", req.institute_code)
        .eq("role", "student")
        .in("status", ["approved", "active"]);
      setStudentProfiles(students || []);
      setSelectedChildId("");
      setLinkDialog({ open: true, req });
      return;
    }

    await executeApproval(req, action, null);
  };

  const executeApproval = async (req: PendingRequest, action: "approved" | "rejected", childId: string | null) => {
    setActionLoading(req.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Update pending_request status
      const { error: reqError } = await supabase
        .from("pending_requests")
        .update({ status: action, reviewed_by: user?.id })
        .eq("id", req.id);
      if (reqError) throw reqError;

      if (action === "approved") {
        // 2. Update profile status to approved
        const { error: profError } = await supabase
          .from("profiles")
          .update({ status: "approved" })
          .eq("user_id", req.user_id);
        if (profError) throw profError;

        // 3. INSERT into user_roles — ignore if already exists (duplicate = fine)
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: req.user_id,
            role: req.role,
            institute_code: req.institute_code,
          });

        // Only ignore duplicate key errors — all other errors must be surfaced
        if (roleError && !roleError.code?.includes("23505") && !roleError.message?.includes("duplicate")) {
          throw new Error(`Failed to assign role: ${roleError.message}`);
        }

        // 4. For parent: store child_id in pending_request extra_data
        if (req.role === "parent" && childId) {
          const existingExtra = (req.extra_data as Record<string, unknown>) || {};
          await supabase
            .from("pending_requests")
            .update({ extra_data: { ...existingExtra, child_id: childId } })
            .eq("id", req.id);
        }

        toast({ title: "Approved!", description: `${req.full_name} has been granted ${req.role} access.` });
      } else {
        // Update profile to rejected
        await supabase.from("profiles").update({ status: "rejected" }).eq("user_id", req.user_id);
        // Remove from user_roles if previously approved
        await supabase.from("user_roles").delete()
          .eq("user_id", req.user_id).eq("role", req.role);
        toast({ title: "Rejected", description: `${req.full_name}'s request has been rejected.` });
      }

      // Always update local state immediately (don't wait for realtime)
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

  const handleParentLinkConfirm = async () => {
    if (!linkDialog.req) return;
    setLinkDialog({ open: false, req: null });
    await executeApproval(linkDialog.req, "approved", selectedChildId || null);
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
              const isPending = req.status === "pending";
              const isRejected = req.status === "rejected";

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
                          {isPending && (
                            <Badge className="text-xs bg-accent-light text-accent border-0 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> Pending
                            </Badge>
                          )}
                          {req.status === "approved" && (
                            <Badge className="text-xs bg-success-light text-success border-0 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge className="text-xs bg-danger-light text-danger border-0 flex items-center gap-1">
                              <XCircle className="w-2.5 h-2.5" /> Rejected
                            </Badge>
                          )}
                          {/* Show child link info for approved parents */}
                          {req.status === "approved" && req.role === "parent" && extra.child_id && (
                            <Badge className="text-xs bg-violet-100 text-violet-600 border-0 flex items-center gap-1">
                              <Link2 className="w-2.5 h-2.5" /> Child linked
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

                      {/* Show Approve/Reject for pending, or Re-approve for rejected */}
                      {(isPending || isRejected) && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            disabled={actionLoading === req.id}
                            className="bg-success-light text-success hover:bg-success hover:text-white border border-success/20 h-8 text-xs gap-1 transition-colors"
                            onClick={() => handleAction(req, "approved")}
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isRejected ? (
                              <RotateCcw className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            {isRejected ? "Re-approve" : "Approve"}
                          </Button>
                          {isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoading === req.id}
                              className="text-danger border-danger/30 hover:bg-danger-light h-8 text-xs gap-1"
                              onClick={() => handleAction(req, "rejected")}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          )}
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

      {/* Parent-Child Link Dialog */}
      <Dialog open={linkDialog.open} onOpenChange={(open) => !open && setLinkDialog({ open: false, req: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-violet-500" />
              Link Parent to Child
            </DialogTitle>
            <DialogDescription>
              Select which student <strong>{linkDialog.req?.full_name}</strong> is the parent of. This enables the parent to view their child's attendance, fees, and announcements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Child's Student ID from request: <span className="font-mono text-primary">{(linkDialog.req?.extra_data as Record<string, string>)?.studentId || "Not provided"}</span></p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Select child from approved students:</p>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {studentProfiles.length === 0 ? (
                    <SelectItem value="none" disabled>No approved students found</SelectItem>
                  ) : (
                    studentProfiles.map((s) => (
                      <SelectItem key={s.user_id} value={s.user_id}>
                        {s.full_name} — {s.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 gradient-hero text-white border-0"
                onClick={handleParentLinkConfirm}
                disabled={actionLoading === linkDialog.req?.id}
              >
                {actionLoading === linkDialog.req?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve & Link"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Approve without linking child (admin can link later)
                  if (linkDialog.req) {
                    setLinkDialog({ open: false, req: null });
                    executeApproval(linkDialog.req, "approved", null);
                  }
                }}
              >
                Approve Without Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">You can also approve now and link the child later.</p>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
