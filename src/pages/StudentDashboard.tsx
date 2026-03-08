import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, BookOpen, ExternalLink } from "lucide-react";

export default function StudentDashboard() {
  return (
    <DashboardLayout title="My Dashboard">
      <div className="space-y-5 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-hero rounded-xl p-5 text-white">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl">Arjun Sharma</h2>
            <p className="text-white/70 text-sm mt-0.5">JEE Advanced A · Roll: JA-001</p>
          </div>
        </motion.div>
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
      </div>
    </DashboardLayout>
  );
}
