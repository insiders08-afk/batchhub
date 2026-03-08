import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trophy, CalendarDays, BookOpen } from "lucide-react";

const tests = [
  { id: 1, name: "Unit Test 3 — Mechanics", batch: "JEE Advanced A", date: "Mar 15, 2025", maxMarks: 100, students: 45, avgScore: 68, status: "upcoming" },
  { id: 2, name: "Full Mock Test — JEE Mains Pattern", batch: "JEE Mains B", date: "Mar 8, 2025", maxMarks: 300, students: 38, avgScore: 187, status: "completed" },
  { id: 3, name: "Genetics & Evolution Quiz", batch: "NEET A", date: "Mar 5, 2025", maxMarks: 50, students: 62, avgScore: 38, status: "completed" },
  { id: 4, name: "Foundation Math Test", batch: "Foundation 9th", date: "Mar 3, 2025", maxMarks: 80, students: 55, avgScore: 61, status: "completed" },
  { id: 5, name: "NEET Chapter Test — Zoology", batch: "NEET B", date: "Mar 18, 2025", maxMarks: 120, students: 41, avgScore: 0, status: "upcoming" },
];

const results = [
  { rank: 1, name: "Arjun Sharma", score: 278, pct: 93, batch: "JEE Mains B" },
  { rank: 2, name: "Sneha Patel", score: 265, pct: 88, batch: "JEE Mains B" },
  { rank: 3, name: "Rohit Kumar", score: 251, pct: 84, batch: "JEE Mains B" },
  { rank: 4, name: "Kavya Singh", score: 243, pct: 81, batch: "JEE Mains B" },
  { rank: 5, name: "Harsh Gupta", score: 232, pct: 77, batch: "JEE Mains B" },
];

const rankColors = ["gradient-hero text-white", "bg-secondary text-foreground", "bg-accent-light text-accent"];

export default function AdminTests() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = tests.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout title="Tests">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" /> Create Test
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Create Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Test Name</Label>
                  <Input placeholder="e.g. Unit Test 4 — Thermodynamics" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Batch</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jee-a">JEE Advanced A</SelectItem>
                        <SelectItem value="jee-b">JEE Mains B</SelectItem>
                        <SelectItem value="neet-a">NEET A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max Marks</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Test Date</Label>
                  <Input type="date" />
                </div>
                <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90" onClick={() => setDialogOpen(false)}>
                  Create Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide">All Tests</h3>
            {filtered.map((test, i) => (
              <motion.div key={test.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="p-4 shadow-card border-border/50 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-sm truncate">{test.name}</span>
                          <Badge className={`text-xs ${test.status === 'upcoming' ? 'bg-accent-light text-accent border-accent/20' : 'bg-success-light text-success border-success/20'}`}>
                            {test.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{test.date}</span>
                          <span>{test.batch}</span>
                          <span>Max: {test.maxMarks} marks</span>
                          <span>{test.students} students</span>
                          {test.status === 'completed' && <span className="text-success font-medium">Avg: {test.avgScore}/{test.maxMarks}</span>}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs flex-shrink-0">
                      {test.status === 'upcoming' ? 'Enter Scores' : 'View Results'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Leaderboard */}
          <div>
            <Card className="shadow-card border-border/50">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="font-display font-semibold text-sm">Top Performers</span>
                <Badge variant="secondary" className="ml-auto text-xs">JEE Mains</Badge>
              </div>
              <div className="divide-y divide-border/40">
                {results.map((r, i) => (
                  <div key={r.rank} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? 'bg-primary-light/40' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < 3 ? rankColors[i] : 'bg-muted text-muted-foreground'}`}>
                      {i < 3 ? (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉') : r.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.pct}%</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{r.score}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
