/**
 * TeacherDemo — completely hardcoded fake data, zero DB calls.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CalendarCheck, ClipboardList, Zap, BookOpen, Trophy, Megaphone } from "lucide-react";

const fakeBatches = [
  { id: "b1", name: "JEE Advanced 2025-A", students: 28, course: "JEE", schedule: "Mon–Fri 9:00 AM" },
  { id: "b2", name: "JEE Mains Crash", students: 22, course: "JEE", schedule: "Sat–Sun 8:00 AM" },
];

const fakeStudents: Record<string, { name: string; pct: number }[]> = {
  b1: [
    { name: "Arjun Verma", pct: 92 },
    { name: "Sneha Patel", pct: 85 },
    { name: "Rohit Singh", pct: 71 },
    { name: "Kavya Nair", pct: 95 },
    { name: "Manish Jha", pct: 68 },
  ],
  b2: [
    { name: "Priya Sharma", pct: 88 },
    { name: "Ajay Yadav", pct: 76 },
    { name: "Deepa Iyer", pct: 94 },
  ],
};

export default function TeacherDemo() {
  const [tab, setTab] = useState<"dashboard" | "attendance" | "tests">("dashboard");
  const [selectedBatch, setSelectedBatch] = useState("b1");

  const students = fakeStudents[selectedBatch] || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-success text-white text-center text-xs py-2 font-medium">
        🎭 Demo Mode — Fake teacher view. <Link to="/" className="underline ml-1">← Back to homepage</Link>
      </div>

      <div className="flex h-[calc(100vh-32px)]">
        <aside className="w-56 bg-card border-r border-border/50 flex flex-col p-4 gap-1 shrink-0">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base text-gradient">Lamba</span>
          </div>

          {[
            { label: "My Dashboard", key: "dashboard" },
            { label: "Attendance", key: "attendance" },
            { label: "Test Scores", key: "tests" },
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
              <p className="text-xs font-semibold">Rahul Sharma</p>
              <p className="text-xs text-muted-foreground">Teacher · Demo Institute</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {tab === "dashboard" && (
            <div className="space-y-5 max-w-2xl">
              <div className="gradient-hero rounded-xl p-5 text-white">
                <p className="text-white/70 text-sm">Welcome back,</p>
                <h2 className="font-display font-bold text-2xl">Rahul Sharma</h2>
                <p className="text-white/70 text-sm mt-0.5">Teacher · Demo Institute</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "My Students", value: "50", icon: Users, color: "text-primary" },
                  { label: "My Batches", value: "2", icon: CalendarCheck, color: "text-success" },
                  { label: "Classes Today", value: "2", icon: ClipboardList, color: "text-accent" },
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
                <h3 className="font-display font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setTab("attendance")} className="w-full gradient-hero text-white border-0 gap-2 h-11">
                    <CalendarCheck className="w-4 h-4" /> Mark Attendance
                  </Button>
                  <Button variant="outline" className="w-full gap-2 h-11 border-primary/30 text-primary hover:bg-primary-light">
                    <Megaphone className="w-4 h-4" /> Post Announcement
                  </Button>
                  <Button onClick={() => setTab("tests")} variant="outline" className="w-full gap-2 h-11 border-accent/30 text-accent hover:bg-accent-light">
                    <Trophy className="w-4 h-4" /> Enter Test Scores
                  </Button>
                  <Button variant="outline" className="w-full gap-2 h-11 border-success/30 text-success hover:bg-success-light">
                    <BookOpen className="w-4 h-4" /> Post Homework
                  </Button>
                </div>
              </Card>

              <h3 className="font-display font-semibold">My Batches</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fakeBatches.map((b, i) => (
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
                      <p className="text-xs text-muted-foreground mb-3">{b.students} students · {b.schedule}</p>
                      <Button className="w-full h-8 text-xs gradient-hero text-white border-0 hover:opacity-90">Open Workspace</Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === "attendance" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Mark Attendance</h1>
              <div className="flex gap-2">
                {fakeBatches.map(b => (
                  <Button
                    key={b.id}
                    size="sm"
                    variant={selectedBatch === b.id ? "default" : "outline"}
                    onClick={() => setSelectedBatch(b.id)}
                    className={selectedBatch === b.id ? "gradient-hero text-white border-0" : ""}
                  >
                    {b.name}
                  </Button>
                ))}
              </div>
              <Card className="p-5 shadow-card border-border/50">
                <p className="text-sm text-muted-foreground mb-4">Today — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p>
                <div className="space-y-2">
                  {students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/30">
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.pct}% overall attendance</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 text-xs bg-success-light text-success hover:bg-success hover:text-white border border-success/20">P</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-danger/30 text-danger hover:bg-danger-light">A</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === "tests" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Test Scores & Rankings</h1>
              <div className="flex gap-2">
                {fakeBatches.map(b => (
                  <Button
                    key={b.id}
                    size="sm"
                    variant={selectedBatch === b.id ? "default" : "outline"}
                    onClick={() => setSelectedBatch(b.id)}
                    className={selectedBatch === b.id ? "gradient-hero text-white border-0" : ""}
                  >
                    {b.name}
                  </Button>
                ))}
              </div>
              <Card className="p-5 shadow-card border-border/50">
                <h3 className="font-display font-semibold mb-3">Batch Rankings</h3>
                <div className="space-y-2">
                  {students
                    .map((s, i) => ({ ...s, score: Math.floor(60 + Math.random() * 40), max: 100 }))
                    .sort((a, b) => b.score - a.score)
                    .map((s, rank) => (
                      <div key={rank} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/30">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          rank === 0 ? "bg-yellow-100 text-yellow-600" : rank === 1 ? "bg-gray-100 text-gray-600" : rank === 2 ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                        }`}>
                          {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : rank + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.name}</p>
                        </div>
                        <p className="font-display font-bold">{s.score}<span className="text-xs text-muted-foreground">/{s.max}</span></p>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
