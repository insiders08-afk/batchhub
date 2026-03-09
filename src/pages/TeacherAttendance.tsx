import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CheckCircle2, XCircle, CalendarDays, Users, ChevronLeft,
  Loader2, TrendingUp, Search, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Batch {
  id: string;
  name: string;
  course: string;
}

interface StudentProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

interface AttendanceHistoryItem {
  date: string;
  present: number;
  total: number;
  pct: number;
}

interface StudentStats {
  student: StudentProfile;
  total: number;
  present: number;
  pct: number;
  history: { date: string; present: boolean }[];
}

export default function TeacherAttendance() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const [batchHistory, setBatchHistory] = useState<AttendanceHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instituteCode, setInstituteCode] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Student analytics dialog
  const [selectedStudent, setSelectedStudent] = useState<StudentStats | null>(null);
  const [loadingStudentStats, setLoadingStudentStats] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth/teacher"); return; }
      setUserId(user.id);

      const { data: code } = await supabase.rpc("get_my_institute_code");
      setInstituteCode(code || "");

      const { data: batchData } = await supabase
        .from("batches")
        .select("id, name, course")
        .eq("teacher_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (batchData) {
        setBatches(batchData);
        if (batchData.length > 0) setSelectedBatchId(batchData[0].id);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const loadBatchData = useCallback(async (batchId: string) => {
    if (!batchId) return;
    setLoadingStudents(true);
    try {
      const { data: enrollments } = await supabase
        .from("students_batches")
        .select("student_id")
        .eq("batch_id", batchId);

      const ids = (enrollments || []).map(e => e.student_id);
      let profiles: StudentProfile[] = [];
      if (ids.length > 0) {
        const { data } = await supabase.from("profiles").select("user_id, full_name, email, phone").in("user_id", ids);
        profiles = (data || []) as StudentProfile[];
      }
      setStudents(profiles);

      // Today's attendance
      const { data: todayAtt } = await supabase
        .from("attendance")
        .select("student_id, present")
        .eq("batch_id", batchId)
        .eq("date", today)
        .in("student_id", ids.length > 0 ? ids : ["none"]);

      const attMap: Record<string, "present" | "absent"> = {};
      profiles.forEach(p => { attMap[p.user_id] = "present"; });
      (todayAtt || []).forEach(a => { attMap[a.student_id] = a.present ? "present" : "absent"; });
      setAttendance(attMap);

      // Batch history
      const { data: histData } = await supabase
        .from("attendance")
        .select("date, present, student_id")
        .eq("batch_id", batchId)
        .order("date", { ascending: false })
        .limit(500);

      const dateMap: Record<string, { present: number; total: number }> = {};
      (histData || []).forEach(a => {
        if (a.date === today) return;
        if (!dateMap[a.date]) dateMap[a.date] = { present: 0, total: 0 };
        dateMap[a.date].total++;
        if (a.present) dateMap[a.date].present++;
      });

      const histItems = Object.entries(dateMap)
        .map(([date, val]) => ({
          date,
          present: val.present,
          total: val.total,
          pct: val.total > 0 ? Math.round((val.present / val.total) * 100) : 0,
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10);

      setBatchHistory(histItems);
    } finally {
      setLoadingStudents(false);
    }
  }, [today]);

  useEffect(() => {
    if (selectedBatchId) loadBatchData(selectedBatchId);
  }, [selectedBatchId, loadBatchData]);

  const toggle = (uid: string) =>
    setAttendance(prev => ({ ...prev, [uid]: prev[uid] === "present" ? "absent" : "present" }));

  const markAll = (status: "present" | "absent") =>
    setAttendance(Object.fromEntries(students.map(s => [s.user_id, status])));

  const saveAttendance = async () => {
    if (!selectedBatchId || students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        batch_id: selectedBatchId,
        student_id: s.user_id,
        date: today,
        present: attendance[s.user_id] === "present",
        institute_code: instituteCode,
        marked_by: userId,
      }));
      const { error } = await supabase.from("attendance").upsert(records, { onConflict: "batch_id,student_id,date" });
      if (error) throw error;
      toast({ title: "✅ Attendance saved!", description: `${students.length} students recorded for ${today}.` });
      loadBatchData(selectedBatchId);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openStudentAnalytics = async (student: StudentProfile) => {
    setLoadingStudentStats(true);
    setSelectedStudent(null);
    const { data: attData } = await supabase
      .from("attendance")
      .select("date, present")
      .eq("batch_id", selectedBatchId)
      .eq("student_id", student.user_id)
      .order("date", { ascending: false })
      .limit(100);
    const records = attData || [];
    const presentCount = records.filter(a => a.present).length;
    setSelectedStudent({
      student,
      total: records.length,
      present: presentCount,
      pct: records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0,
      history: records.map(a => ({ date: a.date, present: a.present })),
    });
    setLoadingStudentStats(false);
  };

  const presentCount = Object.values(attendance).filter(v => v === "present").length;
  const pct = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
  const filtered = students.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));
  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  if (loading) return (
    <DashboardLayout title="Attendance" role="teacher">
      <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Attendance" role="teacher">
      <div className="space-y-5">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No batches assigned. Ask your admin to assign you to a batch.</p>
          ) : (
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger className="w-full sm:w-56 h-9">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name} — {b.course}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => markAll("present")} className="h-9 text-success border-success/30 hover:bg-success-light gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Present
            </Button>
            <Button size="sm" variant="outline" onClick={() => markAll("absent")} className="h-9 text-danger border-danger/30 hover:bg-danger-light gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> All Absent
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's Attendance */}
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Present", value: presentCount, color: "text-success" },
                { label: "Absent", value: students.length - presentCount, color: "text-danger" },
                { label: "Rate", value: `${pct}%`, color: pct >= 75 ? "text-success" : "text-danger" },
              ].map(s => (
                <Card key={s.label} className="p-4 text-center shadow-card border-border/50">
                  <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </Card>
              ))}
            </div>

            <Card className="shadow-card border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="font-display font-semibold text-sm">Today — {selectedBatch?.name || "No Batch"}</span>
                <Badge variant="secondary" className="ml-auto text-xs">{todayDisplay}</Badge>
              </div>

              {loadingStudents ? (
                <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                  <Users className="w-8 h-8 mb-2" />
                  <p className="text-sm">No students enrolled in this batch.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[440px] overflow-y-auto">
                  {filtered.map((s, i) => (
                    <motion.div
                      key={s.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <button
                        className="flex items-center gap-3 flex-1 text-left"
                        onClick={() => openStudentAnalytics(s)}
                      >
                        <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium hover:text-primary transition-colors">{s.full_name}</p>
                          <p className="text-xs text-muted-foreground">{s.phone || s.email}</p>
                        </div>
                        <BarChart3 className="w-3.5 h-3.5 text-muted-foreground ml-1 flex-shrink-0" />
                      </button>
                      <button
                        onClick={() => toggle(s.user_id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-3",
                          attendance[s.user_id] === "present"
                            ? "bg-success-light text-success hover:bg-success hover:text-white"
                            : "bg-danger-light text-danger hover:bg-danger hover:text-white"
                        )}
                      >
                        {attendance[s.user_id] === "present"
                          ? <><CheckCircle2 className="w-3.5 h-3.5" /> Present</>
                          : <><XCircle className="w-3.5 h-3.5" /> Absent</>
                        }
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="p-4 border-t border-border/50">
                <Button
                  className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90"
                  onClick={saveAttendance}
                  disabled={saving || students.length === 0}
                >
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Attendance"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Batch History */}
          <div className="space-y-3">
            <Card className="shadow-card border-border/50">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-display font-semibold text-sm">Recent History</span>
              </div>
              {batchHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <CalendarDays className="w-7 h-7 mb-2" />
                  <p className="text-sm text-center px-4">No previous attendance records yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {batchHistory.map((h, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">
                          {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <span className={`text-sm font-bold ${h.pct >= 85 ? "text-success" : h.pct >= 75 ? "text-warning" : "text-danger"}`}>
                          {h.pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${h.pct >= 85 ? "bg-success" : h.pct >= 75 ? "bg-warning" : "bg-danger"}`}
                          style={{ width: `${h.pct}%` }}
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{h.present}/{h.total} present</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Student Analytics Dialog */}
      <Dialog open={!!selectedStudent || loadingStudentStats} onOpenChange={(open) => { if (!open) { setSelectedStudent(null); setLoadingStudentStats(false); } }}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {selectedStudent?.student.full_name || "Loading..."}
            </DialogTitle>
          </DialogHeader>
          {loadingStudentStats ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : selectedStudent ? (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Classes", value: selectedStudent.total },
                  { label: "Present", value: selectedStudent.present, color: "text-success" },
                  { label: "Attendance", value: `${selectedStudent.pct}%`, color: selectedStudent.pct >= 75 ? "text-success" : "text-danger" },
                ].map(s => (
                  <div key={s.label} className="bg-muted/40 rounded-lg p-3 text-center border border-border/30">
                    <div className={`text-xl font-display font-bold ${s.color || ""}`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Attendance Rate</span>
                  <span className={selectedStudent.pct >= 75 ? "text-success font-semibold" : "text-danger font-semibold"}>
                    {selectedStudent.pct >= 75 ? "✓ Good Standing" : "⚠ Below 75%"}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${selectedStudent.pct >= 85 ? "bg-success" : selectedStudent.pct >= 75 ? "bg-warning" : "bg-danger"}`}
                    style={{ width: `${selectedStudent.pct}%` }}
                  />
                </div>
              </div>

              {/* Daily history */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Daily Records</h4>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {selectedStudent.history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No records yet.</p>
                  ) : (
                    selectedStudent.history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30">
                        <span className="text-sm">
                          {new Date(h.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <Badge className={h.present
                          ? "bg-success-light text-success border-success/20 text-xs"
                          : "bg-danger-light text-danger border-danger/20 text-xs"
                        }>
                          {h.present ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
