import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarCheck, Users, ExternalLink } from "lucide-react";

const myBatches = [
  { id: "jee-a", name: "JEE Advanced A", students: 45, attendance: 88, next: "Today 8:00 AM" },
  { id: "jee-b", name: "JEE Mains B", students: 38, attendance: 79, next: "Tomorrow 10:00 AM" },
];

export default function TeacherDashboard() {
  return (
    <DashboardLayout title="My Dashboard">
      <div className="space-y-5 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="gradient-hero rounded-xl p-5 text-white mb-5">
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-2xl">Amit Gupta</h2>
            <p className="text-white/70 text-sm mt-0.5">Teacher · Apex Classes</p>
          </div>
        </motion.div>
        <h3 className="font-display font-semibold">My Batches</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myBatches.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm">{b.name.slice(0,2)}</div>
                  <div>
                    <p className="font-semibold text-sm">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.next}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/>{b.students} students</span>
                  <span className={`flex items-center gap-1 font-medium ${b.attendance >= 80 ? 'text-success' : 'text-warning'}`}><CalendarCheck className="w-3.5 h-3.5"/>{b.attendance}% today</span>
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
