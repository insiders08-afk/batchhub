import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, CalendarCheck, IndianRupee, TrendingUp, AlertTriangle,
  ArrowUpRight, Megaphone, Clock, CheckCircle2, XCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Students",
    value: "847",
    change: "+23 this month",
    trend: "up",
    icon: Users,
    color: "primary",
    bg: "bg-primary-light",
    iconColor: "text-primary",
  },
  {
    title: "Active Batches",
    value: "18",
    change: "3 new this month",
    trend: "up",
    icon: CalendarCheck,
    color: "success",
    bg: "bg-success-light",
    iconColor: "text-success",
  },
  {
    title: "Today's Attendance",
    value: "84%",
    change: "-3% from yesterday",
    trend: "down",
    icon: CheckCircle2,
    color: "accent",
    bg: "bg-accent-light",
    iconColor: "text-accent",
  },
  {
    title: "Fee Collection",
    value: "₹4.2L",
    change: "+₹38K this week",
    trend: "up",
    icon: IndianRupee,
    color: "primary",
    bg: "bg-primary-light",
    iconColor: "text-primary",
  },
];

const weeklyAttendance = [
  { day: "Mon", attendance: 88 },
  { day: "Tue", attendance: 82 },
  { day: "Wed", attendance: 91 },
  { day: "Thu", attendance: 79 },
  { day: "Fri", attendance: 84 },
  { day: "Sat", attendance: 76 },
];

const batchPerformance = [
  { batch: "JEE-A", score: 78 },
  { batch: "JEE-B", score: 65 },
  { batch: "NEET-A", score: 82 },
  { batch: "NEET-B", score: 71 },
  { batch: "Found.", score: 88 },
];

const alerts = [
  { type: "fee", icon: IndianRupee, color: "danger", text: "12 students have overdue fees (> 30 days)", badge: "Fee" },
  { type: "attendance", icon: AlertTriangle, color: "warning", text: "Ravi Sharma — 58% attendance in JEE-A batch", badge: "Attendance" },
  { type: "attendance", icon: AlertTriangle, color: "warning", text: "Priya Verma — 61% attendance in NEET-B batch", badge: "Attendance" },
  { type: "fee", icon: IndianRupee, color: "danger", text: "₹15,000 pending from Batch JEE-B", badge: "Fee" },
];

const recentAnnouncements = [
  { title: "Unit Test 3 — JEE Advanced Prep", batch: "JEE-A", time: "2 hours ago", teacher: "Amit Gupta" },
  { title: "Holiday Notice: Diwali Vacation (Oct 28 – Nov 4)", batch: "All Batches", time: "Yesterday", teacher: "Admin" },
  { title: "DPP Sheet 12 Uploaded", batch: "NEET-A", time: "Yesterday", teacher: "Dr. Sunita Rao" },
];

const recentBatches = [
  { name: "JEE Advanced A", students: 45, teacher: "Amit Gupta", attendance: 88 },
  { name: "NEET Foundation", students: 62, teacher: "Dr. Sunita Rao", attendance: 91 },
  { name: "JEE Mains B", students: 38, teacher: "Rahul Verma", attendance: 79 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Overview">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${
                    stat.trend === 'up' ? 'text-success' : 'text-danger'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  </span>
                </div>
                <div className="text-2xl font-display font-bold mb-0.5">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className={`text-xs mt-1 font-medium ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  {stat.change}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weekly Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="lg:col-span-2"
          >
            <Card className="p-5 shadow-card border-border/50 h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display font-semibold text-base">Weekly Attendance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">This week across all batches</p>
                </div>
                <Badge variant="secondary" className="text-xs">This Week</Badge>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyAttendance}>
                  <defs>
                    <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(234, 74%, 55%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(234, 74%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 92%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(220, 10%, 50%)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: 'hsl(220, 10%, 50%)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 14%, 90%)', borderRadius: '8px', fontSize: 12 }}
                    formatter={(v) => [`${v}%`, 'Attendance']}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="hsl(234, 74%, 55%)" strokeWidth={2.5} fill="url(#attendGrad)" dot={{ fill: 'hsl(234, 74%, 55%)', r: 3.5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Batch Performance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-5 shadow-card border-border/50 h-full">
              <div className="mb-5">
                <h3 className="font-display font-semibold text-base">Batch Scores</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Avg test performance</p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={batchPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220, 14%, 92%)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 50%)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="batch" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 50%)' }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(220, 14%, 90%)', borderRadius: '8px', fontSize: 12 }}
                    formatter={(v) => [`${v}%`, 'Score']}
                  />
                  <Bar dataKey="score" fill="hsl(234, 74%, 55%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Alerts + Announcements Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alerts */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
            <Card className="p-5 shadow-card border-border/50 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-base">Alerts</h3>
                <Badge className="bg-danger-light text-danger border-danger/20 text-xs">{alerts.length} active</Badge>
              </div>
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/60 border border-border/40">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.color === 'danger' ? 'bg-danger-light' : 'bg-accent-light'
                    }`}>
                      <alert.icon className={`w-3.5 h-3.5 ${alert.color === 'danger' ? 'text-danger' : 'text-warning'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{alert.text}</p>
                    </div>
                    <Badge variant="secondary" className={`text-xs flex-shrink-0 ${
                      alert.color === 'danger' ? 'bg-danger-light text-danger border-danger/20' : 'bg-accent-light text-accent border-accent/20'
                    }`}>
                      {alert.badge}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Announcements */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}>
            <Card className="p-5 shadow-card border-border/50 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-base">Recent Announcements</h3>
                <Link to="/admin/announcements">
                  <Button variant="ghost" size="sm" className="text-primary h-8 text-xs gap-1">
                    View all <ArrowUpRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentAnnouncements.map((ann, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/60 border border-border/40">
                    <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ann.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">{ann.batch}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ann.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Batches */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64 }}>
          <Card className="p-5 shadow-card border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-base">Active Batches</h3>
              <Link to="/admin/batches">
                <Button variant="ghost" size="sm" className="text-primary h-8 text-xs gap-1">
                  Manage <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentBatches.map((batch, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center text-white text-xs font-bold">
                      {batch.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{batch.name}</p>
                      <p className="text-xs text-muted-foreground">{batch.teacher} · {batch.students} students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold">{batch.attendance}%</p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                    <Link to="/batch/jee-a">
                      <Button size="sm" variant="outline" className="h-8 text-xs">Open</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
