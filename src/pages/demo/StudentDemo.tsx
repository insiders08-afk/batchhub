/**
 * StudentDemo — completely hardcoded fake data, zero DB calls.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, BookOpen, Megaphone, Zap, MessageSquare, ExternalLink, Users } from "lucide-react";

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

export default function StudentDemo() {
  const overallPct = Math.round((fakeAttendance.reduce((s, m) => s + m.present, 0) / fakeAttendance.reduce((s, m) => s + m.total, 0)) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent text-white text-center text-xs py-2 font-medium">
        🎭 Demo Mode — Fake student view. <Link to="/" className="underline ml-1">← Back to homepage</Link>
      </div>

      <div className="flex h-[calc(100vh-32px)]">
        <aside className="w-56 bg-card border-r border-border/50 flex flex-col p-4 gap-1 shrink-0">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base text-gradient">Lamba</span>
          </div>

          {["My Dashboard", "Attendance", "Tests", "Homework", "Announcements"].map(item => (
            <div key={item} className={`text-sm px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer transition-colors ${item === "My Dashboard" ? "bg-primary-light text-primary font-semibold" : ""}`}>
              {item}
            </div>
          ))}

          <div className="mt-auto">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
              <p className="text-xs font-semibold">Arjun Verma</p>
              <p className="text-xs text-muted-foreground">Student · Demo Institute</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5 max-w-2xl">
            <div className="gradient-hero rounded-xl p-5 text-white">
              <p className="text-white/70 text-sm">Welcome back,</p>
              <h2 className="font-display font-bold text-2xl">Arjun Verma</h2>
              <p className="text-white/70 text-sm mt-0.5">Demo Institute, Kota</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Attendance", value: `${overallPct}%`, color: overallPct >= 75 ? "text-success" : "text-danger", icon: CalendarCheck },
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
                  { label: "My Attendance", color: "border-primary/30 text-primary hover:bg-primary-light", icon: CalendarCheck },
                  { label: "Tests & Rankings", color: "border-accent/30 text-accent hover:bg-accent-light", icon: Trophy },
                  { label: "Homework / DPP", color: "border-success/30 text-success hover:bg-success-light", icon: BookOpen },
                  { label: "Announcements", color: "border-border text-foreground hover:bg-muted", icon: Megaphone },
                ].map(btn => (
                  <Button key={btn.label} variant="outline" className={`w-full h-10 text-xs gap-1.5 ${btn.color}`}>
                    <btn.icon className="w-3.5 h-3.5" /> {btn.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* My Batches */}
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
                    <Button variant="outline" className="w-full h-8 text-xs gap-1.5 text-accent border-accent/30 hover:bg-accent-light">
                      <Trophy className="w-3 h-3" /> Rankings
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full mt-2 h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary-light">
                    Open Workspace <ExternalLink className="w-3 h-3" />
                  </Button>
                </Card>
              </motion.div>
            ))}

            {/* Recent Scores */}
            <Card className="p-5 shadow-card border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold">Recent Scores</h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">View All →</Button>
              </div>
              <div className="space-y-3">
                {fakeTests.map(t => {
                  const pct = Math.round((t.score / t.max) * 100);
                  return (
                    <div key={t.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/30">
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.date} · Rank #{t.rank} of {t.total}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold">{t.score}<span className="text-xs text-muted-foreground">/{t.max}</span></p>
                        <Badge className={`text-xs ${pct >= 75 ? "bg-success-light text-success border-success/20" : "bg-accent-light text-accent border-accent/20"}`}>
                          {pct}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
