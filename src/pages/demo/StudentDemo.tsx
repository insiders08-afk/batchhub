/**
 * StudentDemo — completely hardcoded fake data, zero DB calls.
 */
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, BookOpen, Megaphone, Zap, MessageSquare, ExternalLink, Users, Home } from "lucide-react";

const fakeBatches = [
  { id: "b1", name: "JEE Advanced 2025-A", teacher: "Rahul Sharma", course: "JEE", students: 28 },
];

const fakeTests = [
  { name: "Physics Unit Test 3", date: "04 Mar 2026", score: 78, max: 100, rank: 3, total: 28 },
  { name: "Mathematics Mock 2", date: "28 Feb 2026", score: 91, max: 100, rank: 1, total: 28 },
  { name: "Chemistry Quiz 5", date: "20 Feb 2026", score: 65, max: 100, rank: 9, total: 28 },
];

const fakeAttendance = [
  { month: "March 2026", total: 9, present: 8 },
  { month: "February 2026", total: 24, present: 21 },
  { month: "January 2026", total: 26, present: 25 },
];

const fakeHomeworks = [
  { title: "Rotational Motion — DPP 12", batch: "JEE Advanced 2025-A", due: "10 Mar 2026", type: "DPP" },
  { title: "Organic Chemistry — Homework 8", batch: "JEE Advanced 2025-A", due: "08 Mar 2026", type: "Homework" },
  { title: "Integrals — DPP 15", batch: "JEE Advanced 2025-A", due: "12 Mar 2026", type: "DPP" },
];

const fakeAnnouncements = [
  { title: "Unit Test 3 — Physics rescheduled to Monday", by: "Rahul Sharma", ago: "2h ago" },
  { title: "Holi holiday on 14th March", by: "Admin", ago: "1d ago" },
  { title: "Extra class on Saturday 8 AM", by: "Rahul Sharma", ago: "2d ago" },
];

type Tab = "dashboard" | "attendance" | "tests" | "homework" | "announcements";

export default function StudentDemo() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const overallPct = Math.round((fakeAttendance.reduce((s, m) => s + m.present, 0) / fakeAttendance.reduce((s, m) => s + m.total, 0)) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent text-white text-center text-xs py-2 font-medium">
        🎭 Demo Mode — This is entirely fake data. No real institute.
      </div>

      <div className="flex h-[calc(100vh-32px)]">
        <aside className="w-56 bg-card border-r border-border/50 flex flex-col p-4 gap-1 shrink-0">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base text-gradient">BatchHub</span>
          </div>

          {([
            { label: "My Dashboard", key: "dashboard" },
            { label: "Attendance", key: "attendance" },
            { label: "Tests", key: "tests" },
            { label: "Homework / DPP", key: "homework" },
            { label: "Announcements", key: "announcements" },
          ] as { label: string; key: Tab }[]).map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`text-sm text-left px-3 py-2 rounded-lg transition-colors ${
                tab === item.key ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="mt-auto space-y-2">
            <Link to="/">
              <Button variant="outline" className="w-full gap-2 h-9 text-xs border-primary/30 text-primary hover:bg-primary/10">
                <Home className="w-3.5 h-3.5" /> Back to Homepage
              </Button>
            </Link>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
              <p className="text-xs font-semibold">Arjun Verma</p>
              <p className="text-xs text-muted-foreground">Student · Demo Institute</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {tab === "dashboard" && (
            <div className="space-y-5 max-w-2xl">
              <div className="gradient-hero rounded-xl p-5 text-white">
                <p className="text-white/70 text-sm">Welcome back,</p>
                <h2 className="font-display font-bold text-2xl">Arjun Verma</h2>
                <p className="text-white/70 text-sm mt-0.5">Demo Institute, Kota</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Attendance", value: `${overallPct}%`, color: overallPct >= 75 ? "text-success" : "text-destructive", icon: CalendarCheck },
                  { label: "Tests Done", value: "3", color: "text-accent", icon: Trophy },
                  { label: "My Batches", value: "1", color: "text-primary", icon: BookOpen },
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
                <h3 className="font-display font-semibold mb-3">Quick Access</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "My Attendance", color: "border-primary/30 text-primary hover:bg-primary/10", icon: CalendarCheck, key: "attendance" },
                    { label: "Tests & Rankings", color: "border-accent/30 text-accent hover:bg-accent/10", icon: Trophy, key: "tests" },
                    { label: "Homework / DPP", color: "border-success/30 text-success hover:bg-success/10", icon: BookOpen, key: "homework" },
                    { label: "Announcements", color: "border-border text-foreground hover:bg-muted", icon: Megaphone, key: "announcements" },
                  ].map(btn => (
                    <Button key={btn.label} variant="outline" className={`w-full h-10 text-xs gap-1.5 ${btn.color}`} onClick={() => setTab(btn.key as Tab)}>
                      <btn.icon className="w-3.5 h-3.5" /> {btn.label}
                    </Button>
                  ))}
                </div>
              </Card>

              <h3 className="font-display font-semibold">My Batches</h3>
              {fakeBatches.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                  <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white font-bold text-sm">
                        {b.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{b.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">{b.course}</Badge>
                          <span className="text-xs text-muted-foreground">{b.teacher}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Users className="w-3.5 h-3.5" />{b.students}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="w-full h-8 text-xs gap-1.5 gradient-hero text-white border-0 hover:opacity-90">
                        <MessageSquare className="w-3 h-3" /> Batch Chat
                      </Button>
                      <Button variant="outline" className="w-full h-8 text-xs gap-1.5 text-accent border-accent/30 hover:bg-accent/10">
                        <Trophy className="w-3 h-3" /> Rankings
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full mt-2 h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10">
                      Open Workspace <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "attendance" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">My Attendance</h1>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                <CalendarCheck className="w-6 h-6 text-success" />
                <div>
                  <p className="font-display font-bold text-2xl text-success">{overallPct}%</p>
                  <p className="text-xs text-muted-foreground">Overall attendance · Above 75% ✓</p>
                </div>
              </div>
              {fakeAttendance.map((m, i) => (
                <Card key={i} className="p-4 shadow-card border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{m.month}</p>
                    <Badge className={`text-xs ${(m.present / m.total) >= 0.75 ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                      {Math.round((m.present / m.total) * 100)}%
                    </Badge>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full bg-success" style={{ width: `${(m.present / m.total) * 100}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{m.present} present out of {m.total} classes</p>
                </Card>
              ))}
            </div>
          )}

          {tab === "tests" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Tests & Rankings</h1>
              <div className="space-y-3">
                {fakeTests.map(t => {
                  const pct = Math.round((t.score / t.max) * 100);
                  return (
                    <Card key={t.name} className="p-4 shadow-card border-border/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.date} · Rank #{t.rank} of {t.total}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold">{t.score}<span className="text-xs text-muted-foreground">/{t.max}</span></p>
                        <Badge className={`text-xs ${pct >= 75 ? "bg-success/10 text-success border-success/20" : "bg-accent/10 text-accent border-accent/20"}`}>
                          {pct}%
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "homework" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Homework & DPPs</h1>
              <div className="space-y-3">
                {fakeHomeworks.map((hw, i) => (
                  <Card key={i} className="p-4 shadow-card border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hw.type === "DPP" ? "bg-accent/10" : "bg-primary/10"}`}>
                        <BookOpen className={`w-4 h-4 ${hw.type === "DPP" ? "text-accent" : "text-primary"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{hw.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {hw.due}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{hw.type}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "announcements" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Announcements</h1>
              <div className="space-y-3">
                {fakeAnnouncements.map((a, i) => (
                  <Card key={i} className="p-4 shadow-card border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.ago} · By {a.by}</p>
                      </div>
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
