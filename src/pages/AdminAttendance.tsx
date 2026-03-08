import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle2, XCircle, Clock, CalendarDays, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Batch = Tables<"batches">;
type Profile = Tables<"profiles">;

interface AttendanceHistoryItem {
  date: string;
  present: number;
  absent: number;
  pct: number;
}

export default function AdminAttendance() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [students, setStudents] = useState<Profile[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayDisplay = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Load batches
  useEffect(() => {
    const fetchBatches = async () => {
      setLoadingBatches(true);
      const { data, error } = await supabase.from("batches").select("*").eq("is_active", true).order("name");
      if (!error && data) {
        setBatches(data);
        if (data.length > 0) setSelectedBatchId(data[0].id);
      }
      setLoadingBatches(false);
    };
    fetchBatches();
  }, []);

  // Load students & history when batch changes
  const loadBatchData = useCallback(async (batchId: string) => {
    if (!batchId) return;
    setLoadingStudents(true);
    try {
      // Get enrolled students
      const { data: enrollments, error: enrollErr } = await supabase
        .from("students_batches")
        .select("student_id, profiles!inner(id, user_id, full_name, email, phone, role, status, institute_code, avatar_url, created_at, updated_at)")
        .eq("batch_id", batchId);

      if (enrollErr) throw enrollErr;

      const profiles: Profile[] = (enrollments || []).map(e => e.profiles as Profile);
      setStudents(profiles);

      // Load today's existing attendance
      const studentIds = profiles.map(p => p.user_id);
      const { data: todayAtt } = await supabase
        .from("attendance")
        .select("student_id, present")
        .eq("batch_id", batchId)
        .eq("date", today)
        .in("student_id", studentIds.length > 0 ? studentIds : ["none"]);

      // Default all to present, override with saved values
      const attMap: Record<string, "present" | "absent"> = {};
      profiles.forEach(p => { attMap[p.user_id] = "present"; });
      (todayAtt || []).forEach(a => { attMap[a.student_id] = a.present ? "present" : "absent"; });
      setAttendance(attMap);

      // Load history (last 5 unique dates)
      const { data: histData } = await supabase
        .from("attendance")
        .select("date, present")
        .eq("batch_id", batchId)
        .neq("date", today)
        .order("date", { ascending: false })
        .limit(200);

      // Group by date
      const dateMap: Record<string, { present: number; total: number }> = {};
      (histData || []).forEach(a => {
        if (!dateMap[a.date]) dateMap[a.date] = { present: 0, total: 0 };
        dateMap[a.date].total++;
        if (a.present) dateMap[a.date].present++;
      });

      const histItems: AttendanceHistoryItem[] = Object.entries(dateMap)
        .slice(0, 5)
        .map(([date, val]) => ({
          date: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          present: val.present,
          absent: val.total - val.present,
          pct: val.total > 0 ? Math.round((val.present / val.total) * 100) : 0,
        }));

      setHistory(histItems);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to load batch data", variant: "destructive" });
    } finally {
      setLoadingStudents(false);
    }
  }, [today, toast]);

  useEffect(() => {
    if (selectedBatchId) loadBatchData(selectedBatchId);
  }, [selectedBatchId, loadBatchData]);

  const toggle = (userId: string) => {
    setAttendance(prev => ({ ...prev, [userId]: prev[userId] === "present" ? "absent" : "present" }));
  };

  const markAll = (status: "present" | "absent") => {
    setAttendance(Object.fromEntries(students.map(s => [s.user_id, status])));
  };

  const saveAttendance = async () => {
    if (!selectedBatchId || students.length === 0) return;
    setSaving(true);
    try {
      const instituteCode = await supabase.rpc("get_my_institute_code");
      const { data: { user } } = await supabase.auth.getUser();

      const records = students.map(s => ({
        batch_id: selectedBatchId,
        student_id: s.user_id,
        date: today,
        present: attendance[s.user_id] === "present",
        institute_code: instituteCode.data!,
        marked_by: user?.id ?? null,
      }));

      const { error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "batch_id,student_id,date" });

      if (error) throw error;

      toast({ title: "✅ Attendance saved!", description: `Saved for ${students.length} students.` });
      loadBatchData(selectedBatchId);
    } catch (err: unknown) {
      toast({ title: "Error saving attendance", description: err instanceof Error ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(v => v === "present").length;
  const pct = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
  const filtered = students.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));
  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-5">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {loadingBatches ? (
            <div className="w-56 h-9 bg-muted animate-pulse rounded-md" />
          ) : (
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger className="w-full sm:w-56 h-9">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
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
                { label: "Present", value: presentCount, color: "success" },
                { label: "Absent", value: students.length - presentCount, color: "danger" },
                { label: "Attendance %", value: `${pct}%`, color: pct >= 75 ? "success" : "danger" },
              ].map(s => (
                <Card key={s.label} className="p-4 text-center shadow-card border-border/50">
                  <div className={`text-2xl font-display font-bold ${s.color === "success" ? "text-success" : "text-danger"}`}>{s.value}</div>
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
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                  <Users className="w-8 h-8 mb-2" />
                  <p className="text-sm">No students enrolled in this batch.</p>
                  <p className="text-xs mt-1">Go to Batches → Enroll Students to add students.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[420px] overflow-y-auto">
                  {filtered.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.full_name}</p>
                          <p className="text-xs text-muted-foreground">{s.phone || s.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggle(s.user_id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
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

          {/* History */}
          <div>
            <Card className="shadow-card border-border/50 h-full">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-display font-semibold text-sm">Recent History</span>
              </div>
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground px-4 text-center">
                  <CalendarDays className="w-7 h-7 mb-2" />
                  <p className="text-sm">No previous records yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {history.map((h, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{h.date}</span>
                        <span className={`text-sm font-bold ${h.pct >= 85 ? "text-success" : h.pct >= 75 ? "text-warning" : "text-danger"}`}>
                          {h.pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${h.pct >= 85 ? "bg-success" : h.pct >= 75 ? "bg-warning" : "bg-danger"}`}
                          style={{ width: `${h.pct}%` }}
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{h.present} present</span>
                        <span className="text-xs text-muted-foreground">{h.absent} absent</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
