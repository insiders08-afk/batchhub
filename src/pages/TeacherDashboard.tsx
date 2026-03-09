import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarCheck, Users, ExternalLink, Megaphone, ClipboardList, Loader2, Trophy, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Batch {
  id: string;
  name: string;
  course: string;
  schedule: string | null;
  studentCount: number;
}

export default function TeacherDashboard() {
  const [userName, setUserName] = useState("Teacher");
  const [instituteName, setInstituteName] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

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

      const { data: batchData } = await supabase
        .from("batches")
        .select("id, name, course, schedule")
        .eq("teacher_id", user.id)
        .eq("is_active", true);

      if (batchData) {
        const enriched = await Promise.all(
          batchData.map(async (b) => {
            const { count } = await supabase
              .from("students_batches")
              .select("id", { count: "exact" })
              .eq("batch_id", b.id);
            return { ...b, studentCount: count || 0 };
          })
        );
        setBatches(enriched);
        setTotalStudents(enriched.reduce((sum, b) => sum + b.studentCount, 0));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="My Dashboard" role="teacher">
      <div className="space-y-5 max-w-3xl">

        {/* Welcome hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-hero rounded-xl p-5 text-white">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl">{loading ? "..." : userName}</h2>
            <p className="text-white/70 text-sm mt-0.5">Teacher · {instituteName || "..."}</p>
          </div>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "My Students", value: loading ? "—" : String(totalStudents), icon: Users, color: "text-primary" },
            { label: "My Batches", value: loading ? "—" : String(batches.length), icon: CalendarCheck, color: "text-success" },
            { label: "Classes Today", value: loading ? "—" : String(batches.length), icon: ClipboardList, color: "text-accent" },
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

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 shadow-card border-border/50">
            <h3 className="font-display font-semibold mb-3">Quick Actions</h3>
            {batches.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/teacher/attendance">
                  <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2 h-11">
                    <CalendarCheck className="w-4 h-4" /> Mark Attendance
                  </Button>
                </Link>
                <Link to="/teacher/announcements">
                  <Button variant="outline" className="w-full gap-2 h-11 border-primary/30 text-primary hover:bg-primary-light">
                    <Megaphone className="w-4 h-4" /> Post Announcement
                  </Button>
                </Link>
                <Link to="/teacher/tests">
                  <Button variant="outline" className="w-full gap-2 h-11 border-accent/30 text-accent hover:bg-accent-light">
                    <Trophy className="w-4 h-4" /> Enter Test Scores
                  </Button>
                </Link>
                <Link to="/teacher/homework">
                  <Button variant="outline" className="w-full gap-2 h-11 border-success/30 text-success hover:bg-success-light">
                    <BookOpen className="w-4 h-4" /> Post Homework / DPP
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No batches assigned yet. Ask your admin.</p>
            )}
          </Card>
        </motion.div>

        {/* My Batches */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <h3 className="font-display font-semibold">My Batches</h3>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : batches.length === 0 ? (
          <Card className="p-8 text-center shadow-card border-border/50">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No batches assigned to you yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {batches.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 + i * 0.08 }}>
                <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm">
                      {b.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{b.name}</p>
                      <Badge variant="secondary" className="text-xs mt-0.5">{b.course}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{b.studentCount} students</span>
                    {b.schedule && <span className="text-xs">{b.schedule}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/batch/${b.id}`}>
                      <Button className="w-full h-8 text-xs gap-1.5 gradient-hero text-white border-0 hover:opacity-90">
                        <MessageSquare className="w-3 h-3" /> Chat & More
                      </Button>
                    </Link>
                    <Link to={`/teacher/tests`}>
                      <Button variant="outline" className="w-full h-8 text-xs gap-1.5 text-accent border-accent/30 hover:bg-accent-light">
                        <Trophy className="w-3 h-3" /> Rankings
                      </Button>
                    </Link>
                  </div>
                  <Link to={`/batch/${b.id}`} className="mt-2 block">
                    <Button variant="outline" className="w-full h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary-light">
                      Open Workspace <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
