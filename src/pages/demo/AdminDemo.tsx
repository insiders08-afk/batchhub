/**
 * AdminDemo — completely hardcoded fake data, zero DB calls.
 * This page is served at /demo/admin from the landing page demo buttons.
 * It must NEVER touch Supabase or show real institute data.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, CalendarCheck, IndianRupee, CheckCircle2, TrendingUp,
  Megaphone, Clock, AlertTriangle, ArrowUpRight, Zap, ArrowLeft
} from "lucide-react";

const fakeBatches = [
  { id: "b1", name: "JEE Advanced 2025-A", teacher: "Rahul Sharma", students: 28, course: "JEE" },
  { id: "b2", name: "NEET Dropper Batch", teacher: "Priya Mehta", students: 35, course: "NEET" },
  { id: "b3", name: "Foundation XI", teacher: "Arun Kumar", students: 40, course: "Foundation" },
];

const fakeAnnouncements = [
  { id: "a1", title: "Unit Test 3 — Physics scheduled for Monday", by: "Rahul Sharma", ago: "2h ago" },
  { id: "a2", title: "Fee reminder: last date is 15th March", by: "Admin", ago: "1d ago" },
  { id: "a3", title: "Holiday on 14th March — Holi", by: "Admin", ago: "2d ago" },
];

const stats = [
  { title: "Total Students", value: "103", icon: Users, bg: "bg-primary-light", color: "text-primary", trend: "up" },
  { title: "Active Batches", value: "3", icon: CalendarCheck, bg: "bg-success-light", color: "text-success", trend: "up" },
  { title: "Today's Attendance", value: "87%", icon: CheckCircle2, bg: "bg-accent-light", color: "text-accent", trend: "up" },
  { title: "Unpaid Fees", value: "7", icon: IndianRupee, bg: "bg-danger-light", color: "text-danger", trend: "down" },
];

export default function AdminDemo() {
  const [tab, setTab] = useState<"dashboard" | "batches" | "attendance">("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-accent text-white text-center text-xs py-2 font-medium">
        🎭 Demo Mode — This is fake data only. <Link to="/" className="underline ml-1">← Back to homepage</Link>
      </div>

      {/* Fake Sidebar + Content */}
      <div className="flex h-[calc(100vh-32px)]">
        {/* Sidebar */}
        <aside className="w-56 bg-card border-r border-border/50 flex flex-col p-4 gap-1 shrink-0">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base text-gradient">Lamba</span>
          </div>

          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide px-2 mb-1">Demo Institute</p>

          {[
            { label: "Overview", key: "dashboard" },
            { label: "Batches", key: "batches" },
            { label: "Attendance", key: "attendance" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key as typeof tab)}
              className={`text-sm text-left px-3 py-2 rounded-lg transition-colors ${
                tab === item.key ? "bg-primary-light text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="mt-auto">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
              <p className="text-xs font-semibold">Sanjay Mishra</p>
              <p className="text-xs text-muted-foreground">Admin · Demo Institute</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {tab === "dashboard" && (
            <div className="space-y-5 max-w-4xl">
              <h1 className="text-xl font-display font-bold">Overview</h1>

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                    <Card className="p-5 shadow-card border-border/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                          <s.icon className={`w-4 h-4 ${s.color}`} />
                        </div>
                        <TrendingUp className={`w-4 h-4 ${s.trend === "up" ? "text-success" : "text-danger rotate-180"}`} />
                      </div>
                      <div className="text-2xl font-display font-bold">{s.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.title}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-5 shadow-card border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold">Recent Announcements</h3>
                    <Button variant="ghost" size="sm" className="text-primary h-7 text-xs">View all <ArrowUpRight className="w-3 h-3 ml-1" /></Button>
                  </div>
                  <div className="space-y-3">
                    {fakeAnnouncements.map(a => (
                      <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/40">
                        <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                          <Megaphone className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {a.ago} · {a.by}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 shadow-card border-border/50">
                  <h3 className="font-display font-semibold mb-4">Alerts</h3>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-danger-light/30 border border-danger/20">
                    <div className="w-7 h-7 rounded-lg bg-danger-light flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                    </div>
                    <div>
                      <p className="text-sm">7 students have unpaid fees</p>
                      <Button variant="ghost" size="sm" className="text-danger h-6 text-xs p-0 mt-1">View fees →</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === "batches" && (
            <div className="space-y-5 max-w-3xl">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-display font-bold">Batches</h1>
                <Button className="gradient-hero text-white border-0 hover:opacity-90 h-9 text-sm">+ Create Batch</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fakeBatches.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Card className="p-5 shadow-card border-border/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm">
                          {b.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{b.name}</p>
                          <Badge variant="secondary" className="text-xs">{b.course}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{b.teacher} · {b.students} students</p>
                      <Button variant="outline" className="w-full h-8 text-xs">Open Workspace</Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === "attendance" && (
            <div className="space-y-5 max-w-3xl">
              <h1 className="text-xl font-display font-bold">Attendance</h1>
              <div className="space-y-3">
                {fakeBatches.map(b => (
                  <Card key={b.id} className="p-4 shadow-card border-border/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.students} students</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-success text-sm">
                        {Math.floor(80 + Math.random() * 15).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
