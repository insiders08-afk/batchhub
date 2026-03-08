import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, Trophy, BookOpen, ExternalLink,
  FlaskConical, Megaphone, Clock, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Batch {
  id: string;
  name: string;
  teacher_name: string | null;
  course: string;
}

interface TestScore {
  id: string;
  test_name: string;
  test_date: string;
  score: number;
  max_marks: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");
  const [instituteName, setInstituteName] = useState("");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [tests, setTests] = useState<TestScore[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, institute_code")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name);
        if (profile.institute_code) {
          const { data: inst } = await supabase
            .from("institutes")
            .select("institute_name, city")
            .eq("institute_code", profile.institute_code)
            .single();
          if (inst) setInstituteName(`${inst.institute_name}${inst.city ? ", " + inst.city : ""}`);
        }
      }

      // Find enrolled batch
      const { data: enrollment } = await supabase
        .from("students_batches")
        .select("batch_id")
        .eq("student_id", user.id)
        .limit(1)
        .single();

      if (enrollment) {
        const { data: batchData } = await supabase
          .from("batches")
          .select("id, name, teacher_name, course")
          .eq("id", enrollment.batch_id)
          .single();
        if (batchData) {
          setBatch(batchData);

          // Test scores for this batch
          const { data: testData } = await supabase
            .from("test_scores")
            .select("*")
            .eq("batch_id", batchData.id)
            .eq("student_id", user.id)
            .order("test_date", { ascending: false })
            .limit(5);
          setTests(testData || []);

          // Announcements for this batch
          const { data: annData } = await supabase
            .from("announcements")
            .select("id, title, content, created_at")
            .eq("batch_id", batchData.id)
            .order("created_at", { ascending: false })
            .limit(3);
          setAnnouncements(annData || []);

          // Attendance rate
          const { data: attData } = await supabase
            .from("attendance")
            .select("present")
            .eq("batch_id", batchData.id)
            .eq("student_id", user.id);
          if (attData && attData.length > 0) {
            const rate = Math.round((attData.filter(a => a.present).length / attData.length) * 100);
            setAttendanceRate(rate);
          }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <DashboardLayout title="My Dashboard" role="student">
      <div className="space-y-5 max-w-2xl">

        {/* Welcome hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-hero rounded-xl p-5 text-white">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl">{loading ? "..." : userName}</h2>
            <p className="text-white/70 text-sm mt-0.5">
              {batch ? `${batch.name} · ${instituteName}` : instituteName || "..."}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Attendance", value: loading ? "—" : attendanceRate !== null ? `${attendanceRate}%` : "N/A", color: attendanceRate !== null && attendanceRate >= 75 ? "text-success" : "text-danger", icon: CalendarCheck },
            { label: "Tests Done", value: loading ? "—" : String(tests.length), color: "text-accent", icon: Trophy },
            { label: "My Batch", value: loading ? "—" : batch ? "Enrolled" : "None", color: "text-primary", icon: BookOpen },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-4 text-center shadow-card border-border/50">
                <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
                <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* My Batch */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 shadow-card border-border/50">
            <h3 className="font-display font-semibold mb-3">My Batch</h3>
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : batch ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm">
                    {batch.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{batch.name}</p>
                    <p className="text-xs text-muted-foreground">{batch.teacher_name || "Teacher TBD"} · {batch.course}</p>
                  </div>
                </div>
                <Link to={`/batch/${batch.id}`}>
                  <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2">
                    Open Batch Workspace <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">You haven't been enrolled in a batch yet. Ask your admin.</p>
            )}
          </Card>
        </motion.div>

        {/* Recent Test Scores */}
        {tests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
            <Card className="p-5 shadow-card border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <FlaskConical className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold">Recent Test Scores</h3>
              </div>
              <div className="space-y-3">
                {tests.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/30">
                    <div>
                      <p className="text-sm font-semibold">{t.test_name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.test_date).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold">{t.score}<span className="text-xs text-muted-foreground">/{t.max_marks}</span></p>
                      <Badge className={`text-xs ${Math.round(t.score / t.max_marks * 100) >= 75 ? "bg-success-light text-success border-success/20" : "bg-accent-light text-accent border-accent/20"}`}>
                        {Math.round(t.score / t.max_marks * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
            <Card className="p-5 shadow-card border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold">Recent Announcements</h3>
              </div>
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-muted/40 border border-border/30">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />{timeAgo(a.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
