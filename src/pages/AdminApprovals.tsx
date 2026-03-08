import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, XCircle, Clock, BookOpen, GraduationCap,
  UserCircle, Search, Filter
} from "lucide-react";

interface PendingRequest {
  role: "teacher" | "student" | "parent";
  name?: string;
  parentName?: string;
  teacherId?: string;
  studentId?: string;
  parentId?: string;
  instituteId: string;
  subject?: string;
  batchName?: string;
  relation?: string;
  phone: string;
  email?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const roleConfig = {
  teacher: { icon: BookOpen, gradient: "from-success to-emerald-400", label: "Teacher", bg: "bg-success-light", text: "text-success" },
  student: { icon: GraduationCap, gradient: "from-accent to-orange-400", label: "Student", bg: "bg-accent-light", text: "text-accent" },
  parent: { icon: UserCircle, gradient: "from-violet-500 to-purple-600", label: "Parent", bg: "bg-violet-100", text: "text-violet-600" },
};

// Demo requests for display
const demoRequests: PendingRequest[] = [
  { role: "teacher", name: "Dr. Amit Gupta", teacherId: "TCH-001", instituteId: "APEX-KOTA-001", subject: "Physics", phone: "9876543210", email: "amit@apex.com", status: "pending", submittedAt: new Date(Date.now() - 3600000).toISOString() },
  { role: "student", name: "Ravi Sharma", studentId: "STU-2024-045", instituteId: "APEX-KOTA-001", batchName: "JEE-A", phone: "9765432109", email: "ravi@email.com", status: "pending", submittedAt: new Date(Date.now() - 7200000).toISOString() },
  { role: "parent", parentName: "Suresh Sharma", studentId: "STU-2024-045", instituteId: "APEX-KOTA-001", relation: "Father", phone: "9654321098", email: "suresh@email.com", status: "pending", submittedAt: new Date(Date.now() - 10800000).toISOString() },
  { role: "student", name: "Priya Verma", studentId: "STU-2024-046", instituteId: "APEX-KOTA-001", batchName: "NEET-B", phone: "9543210987", email: "priya@email.com", status: "pending", submittedAt: new Date(Date.now() - 14400000).toISOString() },
  { role: "teacher", name: "Sunita Rao", teacherId: "TCH-002", instituteId: "APEX-KOTA-001", subject: "Biology", phone: "9432109876", email: "sunita@apex.com", status: "approved", submittedAt: new Date(Date.now() - 86400000).toISOString() },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${m}m ago`;
}

export default function AdminApprovals() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored: PendingRequest[] = JSON.parse(localStorage.getItem("lamba_pending_requests") || "[]");
    setRequests([...demoRequests, ...stored]);
  }, []);

  const handleAction = (index: number, action: "approved" | "rejected") => {
    const updated = [...requests];
    updated[index] = { ...updated[index], status: action };
    setRequests(updated);
    // Update localStorage
    const stored = updated.filter((r) => !demoRequests.some((d) => d.phone === r.phone && d.name === r.name));
    localStorage.setItem("lamba_pending_requests", JSON.stringify(stored));
  };

  const filtered = requests.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const name = r.name || r.parentName || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      r.instituteId.toLowerCase().includes(search.toLowerCase()) ||
      (r.studentId || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.teacherId || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <DashboardLayout title="Approval Requests">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Review and approve teacher, student, and parent access requests.</p>
          </div>
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
              placeholder="Search by name, student ID, institute ID..."
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

        {/* Role filter pills */}
        <div className="grid grid-cols-3 gap-3">
          {(["teacher", "student", "parent"] as const).map((role) => {
            const cfg = roleConfig[role];
            const count = requests.filter((r) => r.role === role && r.status === "pending").length;
            return (
              <Card key={role} className="p-4 shadow-card border-border/50 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
                  <cfg.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{cfg.label}s</p>
                  <p className="text-xs text-muted-foreground">{count} pending</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Request list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-10 text-center shadow-card border-border/50">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
              <p className="font-semibold">All caught up!</p>
              <p className="text-muted-foreground text-sm">No {filter === "all" ? "" : filter} requests found.</p>
            </Card>
          ) : (
            filtered.map((req, i) => {
              const cfg = roleConfig[req.role];
              const displayName = req.name || req.parentName || "—";
              const displayId = req.teacherId || req.studentId || "—";
              return (
                <motion.div
                  key={i}
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
                          <span className="font-semibold text-sm">{displayName}</span>
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
                          <span>Institute: <strong className="text-foreground">{req.instituteId}</strong></span>
                          {displayId !== "—" && <span>ID: <strong className="text-foreground">{displayId}</strong></span>}
                          {req.studentId && req.role === "parent" && <span>Student ID: <strong className="text-foreground">{req.studentId}</strong></span>}
                          {req.subject && <span>Subject: <strong className="text-foreground">{req.subject}</strong></span>}
                          {req.batchName && <span>Batch: <strong className="text-foreground">{req.batchName}</strong></span>}
                          {req.relation && <span>Relation: <strong className="text-foreground">{req.relation}</strong></span>}
                          <span>Phone: <strong className="text-foreground">{req.phone}</strong></span>
                          <span className="text-muted-foreground/60">{timeAgo(req.submittedAt)}</span>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            className="bg-success-light text-success hover:bg-success hover:text-white border border-success/20 h-8 text-xs gap-1 transition-colors"
                            onClick={() => handleAction(i, "approved")}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-danger border-danger/30 hover:bg-danger-light h-8 text-xs gap-1"
                            onClick={() => handleAction(i, "rejected")}
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
