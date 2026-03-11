import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AttendanceCalendarViewProps {
  batchId: string;
}

interface DayAttendance {
  present: number;
  absent: number;
  absentStudents: { name: string; email: string }[];
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function AttendanceCalendarView({ batchId }: AttendanceCalendarViewProps) {
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [monthData, setMonthData] = useState<Record<string, DayAttendance>>({});
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const isFutureMonth = calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth > today.getMonth());

  const loadMonthData = useCallback(async () => {
    if (!batchId || isFutureMonth) return;
    setLoadingMonth(true);
    setSelectedDate(null);

    const m = String(calMonth + 1).padStart(2, "0");
    const startDate = `${calYear}-${m}-01`;
    const endDate = `${calYear}-${m}-${String(getDaysInMonth(calYear, calMonth)).padStart(2, "0")}`;

    // Get all attendance for this batch+month
    const { data: attRecords } = await supabase
      .from("attendance")
      .select("date, present, student_id")
      .eq("batch_id", batchId)
      .gte("date", startDate)
      .lte("date", endDate);

    if (!attRecords) { setLoadingMonth(false); return; }

    // Get student names
    const studentIds = [...new Set(attRecords.map(a => a.student_id))];
    let nameMap: Record<string, { name: string; email: string }> = {};
    if (studentIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);
      (profiles || []).forEach(p => { nameMap[p.user_id] = { name: p.full_name, email: p.email }; });
    }

    // Group by date
    const dayMap: Record<string, DayAttendance> = {};
    attRecords.forEach(a => {
      if (!dayMap[a.date]) dayMap[a.date] = { present: 0, absent: 0, absentStudents: [] };
      if (a.present) {
        dayMap[a.date].present++;
      } else {
        dayMap[a.date].absent++;
        const info = nameMap[a.student_id];
        if (info) dayMap[a.date].absentStudents.push(info);
      }
    });

    setMonthData(dayMap);
    setLoadingMonth(false);
  }, [batchId, calMonth, calYear, isFutureMonth]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  const formatDateKey = (day: number) => {
    const m = String(calMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${calYear}-${m}-${d}`;
  };

  const selectedDayData = selectedDate ? monthData[selectedDate] : null;

  return (
    <Card className="shadow-card border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        <span className="font-display font-semibold text-sm">Calendar</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Month/Year selectors */}
        <div className="flex gap-2">
          <Select value={String(calMonth)} onValueChange={v => { setCalMonth(parseInt(v)); setSelectedDate(null); }}>
            <SelectTrigger className="h-9 flex-1 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => {
                const future = calYear > today.getFullYear() || (calYear === today.getFullYear() && i > today.getMonth());
                return <SelectItem key={i} value={String(i)} disabled={future}>{m}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Select value={String(calYear)} onValueChange={v => { setCalYear(parseInt(v)); setSelectedDate(null); }}>
            <SelectTrigger className="h-9 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isFutureMonth ? (
          <p className="text-sm text-muted-foreground text-center py-6">Cannot view future months.</p>
        ) : loadingMonth ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Calendar grid */}
            <div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                  <div key={d} className="text-center text-xs text-muted-foreground font-medium">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateKey = formatDateKey(day);
                  const isFutureDay = new Date(calYear, calMonth, day) > today;
                  const data = monthData[dateKey];
                  const isSelected = selectedDate === dateKey;
                  const hasData = !!data;
                  const pct = hasData ? Math.round((data.present / (data.present + data.absent)) * 100) : null;

                  return (
                    <button
                      key={day}
                      disabled={isFutureDay || !hasData}
                      onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center text-xs font-medium rounded-md border transition-all",
                        isFutureDay ? "text-muted-foreground/30 border-transparent cursor-default" :
                        !hasData ? "bg-muted/20 border-border/10 text-muted-foreground/40 cursor-default" :
                        isSelected ? "bg-primary text-primary-foreground border-primary shadow-sm" :
                        pct !== null && pct >= 75 ? "bg-success-light text-success border-success/20 hover:border-success/50 cursor-pointer" :
                        "bg-danger-light text-danger border-danger/20 hover:border-danger/50 cursor-pointer"
                      )}
                    >
                      <span>{day}</span>
                      {hasData && !isFutureDay && (
                        <span className="text-[9px] opacity-75">{pct}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground justify-center">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-success-light border border-success/20 inline-block" /> ≥75%</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-danger-light border border-danger/20 inline-block" /> &lt;75%</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-muted/20 border border-border/10 inline-block" /> No record</span>
              </div>
            </div>

            {/* Selected date detail */}
            {selectedDate && (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <div className="px-3 py-2.5 bg-muted/30 border-b border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-semibold">
                      {new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {selectedDayData && (
                      <>
                        <Badge className="bg-success-light text-success border-success/20 text-xs">{selectedDayData.present} present</Badge>
                        <Badge className="bg-danger-light text-danger border-danger/20 text-xs">{selectedDayData.absent} absent</Badge>
                      </>
                    )}
                  </div>
                </div>
                {!selectedDayData || selectedDayData.absentStudents.length === 0 ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-success text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">Full attendance — no absentees!</span>
                  </div>
                ) : (
                  <div>
                    <div className="px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-danger border-b border-border/30">
                      <XCircle className="w-3.5 h-3.5" />
                      Absentees ({selectedDayData.absentStudents.length})
                    </div>
                    <div className="divide-y divide-border/30 max-h-48 overflow-y-auto">
                      {selectedDayData.absentStudents.map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                          <div className="w-6 h-6 rounded-full bg-danger-light flex items-center justify-center text-danger text-[10px] font-bold flex-shrink-0">
                            {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground">{s.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
