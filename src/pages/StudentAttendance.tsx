import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, CheckCircle2, XCircle, TrendingUp, Loader2, CalendarCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceRecord {
  date: string;
  present: boolean;
  batch_id: string;
}

interface BatchInfo {
  id: string;
  name: string;
  course: string;
}

export default function StudentAttendance() {
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // Get enrolled batches
      const { data: enrollments } = await supabase
        .from("students_batches")
        .select("batch_id")
        .eq("student_id", user.id);

      const batchIds = (enrollments || []).map(e => e.batch_id);
      if (batchIds.length > 0) {
        const { data: batchData } = await supabase
          .from("batches")
          .select("id, name, course")
          .in("id", batchIds);
        setBatches((batchData || []) as BatchInfo[]);
        if (batchData && batchData.length === 1) setSelectedBatch(batchData[0].id);
      }

      // Get all attendance
      const { data: attData } = await supabase
        .from("attendance")
        .select("date, present, batch_id")
        .eq("student_id", user.id)
        .order("date", { ascending: false })
        .limit(300);

      setRecords((attData || []) as AttendanceRecord[]);
      setLoading(false);
    };
    init();
  }, []);

  const filteredRecords = selectedBatch === "all" ? records : records.filter(r => r.batch_id === selectedBatch);
  const totalClasses = filteredRecords.length;
  const presentClasses = filteredRecords.filter(r => r.present).length;
  const absentClasses = totalClasses - presentClasses;
  const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Group by month for calendar-like view
  const byMonth: Record<string, AttendanceRecord[]> = {};
  filteredRecords.forEach(r => {
    const month = r.date.slice(0, 7); // YYYY-MM
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(r);
  });

  const monthEntries = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]));

  if (loading) return (
    <DashboardLayout title="My Attendance" role="student">
      <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="My Attendance" role="student">
      <div className="space-y-5 max-w-2xl">
        {batches.length > 1 && (
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-full sm:w-56 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Classes", value: totalClasses, color: "text-foreground" },
            { label: "Present", value: presentClasses, color: "text-success" },
            { label: "Absent", value: absentClasses, color: "text-danger" },
            { label: "Attendance %", value: `${attendancePct}%`, color: attendancePct >= 75 ? "text-success" : "text-danger" },
          ].map(s => (
            <Card key={s.label} className="p-4 text-center shadow-card border-border/50">
              <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Progress bar */}
        {totalClasses > 0 && (
          <Card className="p-4 shadow-card border-border/50">
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-4 h-4 text-primary" /> Attendance Rate
              </span>
              <span className={`font-bold ${attendancePct >= 75 ? "text-success" : "text-danger"}`}>
                {attendancePct >= 75 ? "✓ Good Standing" : "⚠ Below 75%"}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${attendancePct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${attendancePct >= 85 ? "bg-success" : attendancePct >= 75 ? "bg-warning" : "bg-danger"}`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span className="text-warning">75% required</span>
              <span>100%</span>
            </div>
          </Card>
        )}

        {/* Daily records by month */}
        {totalClasses === 0 ? (
          <Card className="p-10 text-center shadow-card border-border/50">
            <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No attendance records yet</p>
            <p className="text-muted-foreground text-sm mt-1">Your teacher hasn't marked attendance yet.</p>
          </Card>
        ) : (
          monthEntries.map(([month, recs]) => {
            const mDate = new Date(month + "-01");
            const mLabel = mDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
            const mPresent = recs.filter(r => r.present).length;
            const mPct = Math.round((mPresent / recs.length) * 100);
            return (
              <motion.div key={month} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="shadow-card border-border/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{mLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{mPresent}/{recs.length} present</span>
                      <Badge className={`text-xs ${mPct >= 75 ? "bg-success-light text-success border-success/20" : "bg-danger-light text-danger border-danger/20"}`}>
                        {mPct}%
                      </Badge>
                    </div>
                  </div>
                  <div className="divide-y divide-border/30">
                    {recs.sort((a, b) => b.date.localeCompare(a.date)).map(r => (
                      <div key={`${r.date}-${r.batch_id}`} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${r.present ? "bg-success" : "bg-danger"}`} />
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                            </p>
                            {batches.length > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {batches.find(b => b.id === r.batch_id)?.name}
                              </p>
                            )}
                          </div>
                        </div>
                        {r.present ? (
                          <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Present
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-danger text-sm font-medium">
                            <XCircle className="w-4 h-4" /> Absent
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
