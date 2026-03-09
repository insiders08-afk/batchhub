/**
 * ParentDemo — completely hardcoded fake data, zero DB calls.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, IndianRupee, Megaphone, Zap, TrendingUp, CheckCircle2 } from "lucide-react";

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
  ],
};

export default function ParentDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted border-b border-border text-center text-xs py-2 font-medium text-muted-foreground">
        🎭 Demo Mode — Fake parent view. <Link to="/" className="underline text-primary ml-1">← Back to homepage</Link>
      </div>

      <div className="flex h-[calc(100vh-32px)]">
        <aside className="w-56 bg-card border-r border-border/50 flex flex-col p-4 gap-1 shrink-0">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base text-gradient">Lamba</span>
          </div>

          {["My Dashboard", "Child's Attendance", "Test Scores", "Fees", "Announcements"].map(item => (
            <div key={item} className={`text-sm px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition-colors ${item === "My Dashboard" ? "bg-primary-light text-primary font-semibold" : ""}`}>
              {item}
            </div>
          ))}

          <div className="mt-auto">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
              <p className="text-xs font-semibold">Sunita Verma</p>
              <p className="text-xs text-muted-foreground">Parent · Demo Institute</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5 max-w-2xl">
            {/* Child Card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="gradient-hero rounded-xl p-5 text-white">
                <p className="text-white/70 text-sm">Monitoring</p>
                <h2 className="font-display font-bold text-2xl">{child.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">{child.batch} · {child.teacher}</p>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Attendance", value: `${child.attendance}%`, color: "text-success", icon: CalendarCheck },
                { label: "Tests Done", value: String(child.tests.length), color: "text-accent", icon: Trophy },
                { label: "Fees Due", value: "₹3,500", color: "text-danger", icon: IndianRupee },
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

            {/* Attendance */}
            <Card className="p-5 shadow-card border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-primary" />Attendance</h3>
                <Badge className={`text-xs ${child.attendance >= 75 ? "bg-success-light text-success border-success/20" : "bg-danger-light text-danger border-danger/20"}`}>
                  {child.attendance}%
                </Badge>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-success" style={{ width: `${child.attendance}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Above 75% minimum requirement ✓</p>
            </Card>

            {/* Tests */}
            <Card className="p-5 shadow-card border-border/50">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" />Recent Test Scores</h3>
              <div className="space-y-3">
                {child.tests.map(t => {
                  const pct = Math.round((t.score / t.max) * 100);
                  return (
                    <div key={t.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/30">
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold">{t.score}<span className="text-xs text-muted-foreground">/{t.max}</span></p>
                        <Badge className={`text-xs ${pct >= 75 ? "bg-success-light text-success border-success/20" : "bg-accent-light text-accent border-accent/20"}`}>{pct}%</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Fees */}
            <Card className="p-5 shadow-card border-border/50">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-danger" />Fee Status</h3>
              <div className="space-y-2">
                {child.fees.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/30">
                    <div>
                      <p className="text-sm font-medium">{f.desc}</p>
                      {!f.paid && "due" in f && <p className="text-xs text-danger">Due: {f.due}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-sm">₹{f.amount.toLocaleString()}</p>
                      <Badge className={`text-xs ${f.paid ? "bg-success-light text-success border-success/20" : "bg-danger-light text-danger border-danger/20"}`}>
                        {f.paid ? <><CheckCircle2 className="w-3 h-3 mr-1 inline" />Paid</> : "Unpaid"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Announcements */}
            <Card className="p-5 shadow-card border-border/50">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" />Recent Announcements</h3>
              <div className="space-y-3">
                {child.announcements.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/30">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.ago} · {a.by}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
