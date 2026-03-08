import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, Trophy, BookOpen, ExternalLink,
  FlaskConical, Megaphone, Clock
} from "lucide-react";

const upcomingTests = [
  { name: "Physics Mock Test", date: "Mar 15", time: "9:00 AM", type: "Mock" },
  { name: "Chemistry DPP #42", date: "Mar 12", time: "8:00 AM", type: "DPP" },
];

const homework = [
  { title: "Electrostatics — Chapter 8 DPP", due: "Mar 12", subject: "Physics", done: false },
  { title: "Organic Chemistry Practice Set", due: "Mar 14", subject: "Chemistry", done: true },
];

const announcements = [
  { title: "Mock Test on March 15", desc: "Full syllabus Physics mock. Bring calculator.", time: "2 hrs ago" },
  { title: "Holiday on March 10", desc: "Institute closed for Holi. Classes resume March 11.", time: "Yesterday" },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout title="My Dashboard" role="student">
      <div className="space-y-5 max-w-2xl">

        {/* Welcome hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-hero rounded-xl p-5 text-white">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl">Arjun Sharma</h2>
            <p className="text-white/70 text-sm mt-0.5">JEE Advanced A · Roll: JA-001</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Attendance", value: "92%", color: "text-success", icon: CalendarCheck },
            { label: "Batch Rank", value: "#1", color: "text-accent", icon: Trophy },
            { label: "Assignments", value: "2 due", color: "text-primary", icon: BookOpen },
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm">JE</div>
              <div>
                <p className="font-semibold text-sm">JEE Advanced A</p>
                <p className="text-xs text-muted-foreground">Amit Gupta · 45 students</p>
              </div>
            </div>
            <Link to="/batch/jee-a">
              <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2">
                Open Batch Workspace <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        </motion.div>

        {/* Upcoming Tests */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <Card className="p-5 shadow-card border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold">Upcoming Tests</h3>
            </div>
            <div className="space-y-3">
              {upcomingTests.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/30">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />{t.date} · {t.time}
                    </p>
                  </div>
                  <Badge className="bg-primary-light text-primary border-primary/20 text-xs">{t.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Homework / DPP */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <Card className="p-5 shadow-card border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-accent" />
              <h3 className="font-display font-semibold">Homework / DPP</h3>
            </div>
            <div className="space-y-3">
              {homework.map((hw, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
                  hw.done ? "bg-success-light/30 border-success/20" : "bg-muted/40 border-border/30"
                }`}>
                  <div>
                    <p className={`text-sm font-semibold ${hw.done ? "line-through text-muted-foreground" : ""}`}>{hw.title}</p>
                    <p className="text-xs text-muted-foreground">{hw.subject} · Due {hw.due}</p>
                  </div>
                  <Badge className={hw.done
                    ? "bg-success-light text-success border-success/20 text-xs"
                    : "bg-accent-light text-accent border-accent/20 text-xs"
                  }>
                    {hw.done ? "Done" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
          <Card className="p-5 shadow-card border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold">Recent Announcements</h3>
            </div>
            <div className="space-y-3">
              {announcements.map((a, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/30">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold">{a.title}</p>
                    <span className="text-[11px] text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
