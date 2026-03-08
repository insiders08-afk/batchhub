import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle2, XCircle, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const batches = ["JEE Advanced A", "JEE Mains B", "NEET A", "NEET B", "Foundation 9th"];

const students = [
  { id: 1, name: "Arjun Sharma", roll: "JA-001", status: "present" },
  { id: 2, name: "Priya Verma", roll: "JA-002", status: "absent" },
  { id: 3, name: "Rohan Mehta", roll: "JA-003", status: "present" },
  { id: 4, name: "Sneha Patel", roll: "JA-004", status: "present" },
  { id: 5, name: "Aditya Kumar", roll: "JA-005", status: "absent" },
  { id: 6, name: "Kavya Singh", roll: "JA-006", status: "present" },
  { id: 7, name: "Harsh Gupta", roll: "JA-007", status: "present" },
  { id: 8, name: "Ananya Rao", roll: "JA-008", status: "present" },
  { id: 9, name: "Vikram Das", roll: "JA-009", status: "absent" },
  { id: 10, name: "Pooja Nair", roll: "JA-010", status: "present" },
  { id: 11, name: "Rahul Tiwari", roll: "JA-011", status: "present" },
  { id: 12, name: "Isha Joshi", roll: "JA-012", status: "present" },
];

const attendanceHistory = [
  { date: "Mar 7, 2025", present: 40, absent: 5, pct: 89 },
  { date: "Mar 6, 2025", present: 38, absent: 7, pct: 84 },
  { date: "Mar 5, 2025", present: 42, absent: 3, pct: 93 },
  { date: "Mar 4, 2025", present: 36, absent: 9, pct: 80 },
  { date: "Mar 3, 2025", present: 41, absent: 4, pct: 91 },
];

export default function AdminAttendance() {
  const [selectedBatch, setSelectedBatch] = useState(batches[0]);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState<Record<number, "present" | "absent">>(
    Object.fromEntries(students.map(s => [s.id, s.status as "present" | "absent"]))
  );

  const toggle = (id: number) => {
    setAttendance(prev => ({ ...prev, [id]: prev[id] === "present" ? "absent" : "present" }));
  };

  const markAll = (status: "present" | "absent") => {
    setAttendance(Object.fromEntries(students.map(s => [s.id, status])));
  };

  const presentCount = Object.values(attendance).filter(v => v === "present").length;
  const pct = Math.round((presentCount / students.length) * 100);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-5">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-full sm:w-56 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {batches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
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
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Present", value: presentCount, color: "success" },
                { label: "Absent", value: students.length - presentCount, color: "danger" },
                { label: "Attendance %", value: `${pct}%`, color: pct >= 75 ? "success" : "danger" },
              ].map(s => (
                <Card key={s.label} className="p-4 text-center shadow-card border-border/50">
                  <div className={`text-2xl font-display font-bold ${s.color === 'success' ? 'text-success' : s.color === 'danger' ? 'text-danger' : ''}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </Card>
              ))}
            </div>

            <Card className="shadow-card border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="font-display font-semibold text-sm">Today — {selectedBatch}</span>
                <Badge variant="secondary" className="ml-auto text-xs">March 8, 2025</Badge>
              </div>
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
                        {s.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.roll}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(s.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                        attendance[s.id] === "present"
                          ? "bg-success-light text-success hover:bg-success hover:text-white"
                          : "bg-danger-light text-danger hover:bg-danger hover:text-white"
                      )}
                    >
                      {attendance[s.id] === "present"
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Present</>
                        : <><XCircle className="w-3.5 h-3.5" /> Absent</>
                      }
                    </button>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-border/50">
                <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90">
                  Save Attendance
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
              <div className="divide-y divide-border/40">
                {attendanceHistory.map((h, i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{h.date}</span>
                      <span className={`text-sm font-bold ${h.pct >= 85 ? 'text-success' : h.pct >= 75 ? 'text-warning' : 'text-danger'}`}>
                        {h.pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${h.pct >= 85 ? 'bg-success' : h.pct >= 75 ? 'bg-warning' : 'bg-danger'}`}
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
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
