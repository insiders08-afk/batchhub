/**
 * ParentDemo — completely hardcoded fake data, zero DB calls.
 */
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, IndianRupee, Megaphone, Zap, CheckCircle2, Home } from "lucide-react";

const child = {
  name: "Arjun Verma",
  batch: "JEE Advanced 2025-A",
  teacher: "Rahul Sharma",
  attendance: 88,
  tests: [
    { name: "Physics Unit Test 3", date: "04 Mar 2026", score: 78, max: 100 },
    { name: "Mathematics Mock 2", date: "28 Feb 2026", score: 91, max: 100 },
  ],
  fees: [
    { desc: "March 2026 Tuition", amount: 3500, paid: false, due: "15 Mar 2026" },
    { desc: "February 2026 Tuition", amount: 3500, paid: true },
  ],
  announcements: [
    { title: "Unit Test 3 — Physics rescheduled to Monday", by: "Rahul Sharma", ago: "2h ago" },
    { title: "Holi holiday on 14th March", by: "Admin", ago: "1d ago" },
    { title: "Extra class on Saturday 8 AM", by: "Rahul Sharma", ago: "2d ago" },
  ],
};

type Tab = "dashboard" | "attendance" | "tests" | "fees" | "announcements";

export default function ParentDemo() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted border-b border-border text-center text-xs py-2 font-medium text-muted-foreground">
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
            { label: "Child's Attendance", key: "attendance" },
            { label: "Test Scores", key: "tests" },
            { label: "Fees", key: "fees" },
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
              <p className="text-xs font-semibold">Sunita Verma</p>
              <p className="text-xs text-muted-foreground">Parent · Demo Institute</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {tab === "dashboard" && (
            <div className="space-y-5 max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="gradient-hero rounded-xl p-5 text-white">
                  <p className="text-white/70 text-sm">Monitoring</p>
                  <h2 className="font-display font-bold text-2xl">{child.name}</h2>
                  <p className="text-white/70 text-sm mt-0.5">{child.batch} · {child.teacher}</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Attendance", value: `${child.attendance}%`, color: "text-success", icon: CalendarCheck },
                  { label: "Tests Done", value: String(child.tests.length), color: "text-accent", icon: Trophy },
                  { label: "Fees Due", value: "₹3,500", color: "text-destructive", icon: IndianRupee },
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
                    { label: "Attendance", key: "attendance", color: "border-primary/30 text-primary hover:bg-primary/10", icon: CalendarCheck },
                    { label: "Test Scores", key: "tests", color: "border-accent/30 text-accent hover:bg-accent/10", icon: Trophy },
                    { label: "Fees Status", key: "fees", color: "border-destructive/30 text-destructive hover:bg-destructive/10", icon: IndianRupee },
                    { label: "Announcements", key: "announcements", color: "border-border text-foreground hover:bg-muted", icon: Megaphone },
                  ].map(btn => (
                    <Button key={btn.label} variant="outline" className={`w-full h-10 text-xs gap-1.5 ${btn.color}`} onClick={() => setTab(btn.key as Tab)}>
                      <btn.icon className="w-3.5 h-3.5" /> {btn.label}
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="p-5 shadow-card border-border/50">
                <h3 className="font-display font-semibold mb-3">Recent Announcements</h3>
                {child.announcements.slice(0, 2).map((a, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/30 mb-2">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.ago} · {a.by}</p>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {tab === "attendance" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Child's Attendance</h1>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
                <CalendarCheck className="w-6 h-6 text-success" />
                <div>
                  <p className="font-display font-bold text-2xl text-success">{child.attendance}%</p>
                  <p className="text-xs text-muted-foreground">Overall attendance · Above 75% ✓</p>
                </div>
              </div>
              <Card className="p-5 shadow-card border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold">{child.name}</h3>
                  <Badge className="bg-success/10 text-success border-success/20 text-xs">{child.attendance}%</Badge>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-success" style={{ width: `${child.attendance}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Batch: {child.batch}</p>
              </Card>
            </div>
          )}

          {tab === "tests" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Test Scores</h1>
              <div className="space-y-3">
                {child.tests.map(t => {
                  const pct = Math.round((t.score / t.max) * 100);
                  return (
                    <Card key={t.name} className="p-4 shadow-card border-border/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold">{t.score}<span className="text-xs text-muted-foreground">/{t.max}</span></p>
                        <Badge className={`text-xs ${pct >= 75 ? "bg-success/10 text-success border-success/20" : "bg-accent/10 text-accent border-accent/20"}`}>{pct}%</Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "fees" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Fee Status</h1>
              <div className="space-y-3">
                {child.fees.map((f, i) => (
                  <Card key={i} className="p-4 shadow-card border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{f.desc}</p>
                      {!f.paid && "due" in f && <p className="text-xs text-destructive">Due: {f.due}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-sm">₹{f.amount.toLocaleString()}</p>
                      <Badge className={`text-xs ${f.paid ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                        {f.paid ? <><CheckCircle2 className="w-3 h-3 mr-1 inline" />Paid</> : "Unpaid"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "announcements" && (
            <div className="space-y-5 max-w-2xl">
              <h1 className="text-xl font-display font-bold">Announcements</h1>
              <div className="space-y-3">
                {child.announcements.map((a, i) => (
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
