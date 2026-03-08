import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarCheck, Users, ExternalLink, Megaphone, ClipboardList } from "lucide-react";

const myBatches = [
  { id: "jee-a", name: "JEE Advanced A", students: 45, attendance: 88, next: "Today 8:00 AM" },
  { id: "jee-b", name: "JEE Mains B", students: 38, attendance: 79, next: "Tomorrow 10:00 AM" },
];

const todayStats = [
  { label: "Total Students", value: "83", icon: Users, color: "text-primary" },
  { label: "Classes Today", value: "2", icon: CalendarCheck, color: "text-success" },
  { label: "Pending Attendance", value: "1", icon: ClipboardList, color: "text-accent" },
];

export default function TeacherDashboard() {
  return (
    <DashboardLayout title="My Dashboard" role="teacher">
      <div className="space-y-5 max-w-3xl">

        {/* Welcome hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-hero rounded-xl p-5 text-white">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl">Amit Gupta</h2>
            <p className="text-white/70 text-sm mt-0.5">Teacher · Apex Classes, Kota</p>
          </div>
        </motion.div>

        {/* Today's summary */}
        <div className="grid grid-cols-3 gap-3">
          {todayStats.map((s, i) => (
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
            <div className="grid grid-cols-2 gap-3">
              <Link to="/batch/jee-a">
                <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2 h-11">
                  <CalendarCheck className="w-4 h-4" /> Mark Attendance
                </Button>
              </Link>
              <Link to="/batch/jee-a">
                <Button variant="outline" className="w-full gap-2 h-11 border-primary/30 text-primary hover:bg-primary-light">
                  <Megaphone className="w-4 h-4" /> Post Announcement
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* My Batches */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <h3 className="font-display font-semibold">My Batches</h3>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myBatches.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 + i * 0.08 }}>
              <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm">
                    {b.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.next}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{b.students} students</span>
                  <span className={`flex items-center gap-1 font-medium ${b.attendance >= 80 ? "text-success" : "text-accent"}`}>
                    <CalendarCheck className="w-3.5 h-3.5" />{b.attendance}% today
                  </span>
                </div>
                <Link to={`/batch/${b.id}`}>
                  <Button variant="outline" className="w-full h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary-light">
                    Open Workspace <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
