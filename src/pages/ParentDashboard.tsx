import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, Trophy, IndianRupee, Megaphone,
  Phone, CheckCircle2, XCircle, Clock
} from "lucide-react";

const attendanceDays = [
  { day: "Mon", status: "present" }, { day: "Tue", status: "present" },
  { day: "Wed", status: "absent" }, { day: "Thu", status: "present" },
  { day: "Fri", status: "present" }, { day: "Sat", status: "present" },
  { day: "Mon", status: "present" }, { day: "Tue", status: "absent" },
  { day: "Wed", status: "present" }, { day: "Thu", status: "present" },
  { day: "Fri", status: "present" }, { day: "Sat", status: "present" },
  { day: "Mon", status: "present" }, { day: "Tue", status: "present" },
  { day: "Wed", status: "present" }, { day: "Thu", status: "present" },
  { day: "Fri", status: "absent" }, { day: "Sat", status: "present" },
  { day: "Mon", status: "present" }, { day: "Tue", status: "present" },
];

const announcements = [
  { title: "Mock Test on March 15", desc: "Full syllabus Physics mock test. Bring calculator.", time: "2 hrs ago", badge: "Test" },
  { title: "Holiday on March 10", desc: "Institute closed due to Holi. Classes resume March 11.", time: "Yesterday", badge: "Notice" },
  { title: "DPP #42 uploaded", desc: "Daily Practice Problems for Chapters 8-9 are now available.", time: "2 days ago", badge: "Homework" },
];

export default function ParentDashboard() {
  const present = attendanceDays.filter(d => d.status === "present").length;
  const absent = attendanceDays.filter(d => d.status === "absent").length;

  return (
    <DashboardLayout title="Parent Overview" role="parent">
      <div className="space-y-5 max-w-3xl">

        {/* Welcome hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-hero rounded-xl p-5 text-white">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl">Sunita Sharma</h2>
            <p className="text-white/70 text-sm mt-0.5">Parent · Apex Classes, Kota</p>
          </div>
        </motion.div>

        {/* Child summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="p-5 shadow-card border-border/50">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">Your Child</h3>
              <Badge className="bg-success-light text-success border-success/20 text-xs">Enrolled</Badge>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-base">AS</div>
              <div>
                <p className="font-display font-bold text-lg">Arjun Sharma</p>
                <p className="text-sm text-muted-foreground">JEE Advanced A · Roll: JA-001</p>
                <p className="text-xs text-muted-foreground">Teacher: Amit Gupta · 45 students in batch</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Attendance", value: "92%", color: "text-success", icon: CalendarCheck, sub: `${present}/${attendanceDays.length} days` },
            { label: "Batch Rank", value: "#1", color: "text-accent", icon: Trophy, sub: "out of 45" },
            { label: "Fees", value: "Paid ✓", color: "text-primary", icon: IndianRupee, sub: "₹18,000" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <Card className="p-4 text-center shadow-card border-border/50">
                <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
                <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">{s.sub}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Attendance calendar strip */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 shadow-card border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Attendance — Last 20 Classes</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success inline-block"/>Present ({present})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-danger inline-block"/>Absent ({absent})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {attendanceDays.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    d.status === "present" ? "bg-success-light" : "bg-danger-light"
                  }`}>
                    {d.status === "present"
                      ? <CheckCircle2 className="w-4 h-4 text-success" />
                      : <XCircle className="w-4 h-4 text-danger" />
                    }
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Fee status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <Card className="p-5 shadow-card border-border/50">
            <h3 className="font-display font-semibold mb-4">Fee Status</h3>
            <div className="space-y-3">
              {[
                { month: "February 2025", amount: "₹6,000", status: "paid" },
                { month: "March 2025", amount: "₹6,000", status: "paid" },
                { month: "April 2025", amount: "₹6,000", status: "due", due: "Apr 5" },
              ].map((fee, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                  <div>
                    <p className="text-sm font-medium">{fee.month}</p>
                    {fee.status === "due" && <p className="text-xs text-muted-foreground">Due by {fee.due}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{fee.amount}</span>
                    <Badge className={fee.status === "paid"
                      ? "bg-success-light text-success border-success/20 text-xs"
                      : "bg-accent-light text-accent border-accent/20 text-xs"
                    }>
                      {fee.status === "paid" ? "Paid" : "Due"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Total paid: ₹18,000 · Next due: April 5, 2025</p>
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
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <Badge className="bg-primary-light text-primary border-primary/20 text-[10px] px-1.5 py-0">{a.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />{a.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Contact teacher */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-5 shadow-card border-border/50 flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Amit Gupta</p>
              <p className="text-xs text-muted-foreground">Batch Teacher · JEE Advanced A</p>
            </div>
            <Button className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2 h-9 text-sm">
              <Phone className="w-3.5 h-3.5" /> Contact Teacher
            </Button>
          </Card>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
