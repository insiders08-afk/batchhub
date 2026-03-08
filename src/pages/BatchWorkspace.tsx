import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  MessageSquare, Megaphone, CalendarCheck, FlaskConical,
  BookOpen, Trophy, ArrowLeft, Send, Plus, CheckCircle2,
  XCircle, Clock, Users, Zap, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const batchInfo: Record<string, { name: string; course: string; teacher: string; students: number }> = {
  "jee-a": { name: "JEE Advanced A", course: "JEE", teacher: "Amit Gupta", students: 45 },
  "jee-b": { name: "JEE Mains B", course: "JEE", teacher: "Rahul Verma", students: 38 },
  "neet-a": { name: "NEET A Batch", course: "NEET", teacher: "Dr. Sunita Rao", students: 62 },
};

const chatMessages = [
  { id: 1, sender: "Amit Gupta", role: "Teacher", text: "Good morning everyone! Today we'll cover Rotational Dynamics. Please have your formula sheets ready.", time: "8:02 AM", self: false },
  { id: 2, sender: "Arjun Sharma", role: "Student", text: "Sir, will the unit test cover moment of inertia also?", time: "8:04 AM", self: false },
  { id: 3, sender: "Amit Gupta", role: "Teacher", text: "Yes, Arjun. Chapters 7 and 8 both. Focus on derivations.", time: "8:05 AM", self: false },
  { id: 4, sender: "Priya Verma", role: "Student", text: "Sir please share the DPP for today.", time: "8:06 AM", self: false },
  { id: 5, sender: "You", role: "Student", text: "Sir, will there be a doubt session before the test?", time: "8:10 AM", self: true },
  { id: 6, sender: "Amit Gupta", role: "Teacher", text: "Yes! Doubt session on Saturday 6 PM. Please note it down.", time: "8:11 AM", self: false },
];

const announcements = [
  { id: 1, title: "Unit Test 3 Schedule", content: "Unit Test 3 on March 15. Syllabus: Mechanics Ch 1-6, Optics, Modern Physics.", teacher: "Amit Gupta", time: "2 hours ago", type: "test" },
  { id: 2, title: "DPP Sheet 14 — Rotational Dynamics", content: "DPP 14 uploaded. Complete by tomorrow morning.", teacher: "Amit Gupta", time: "Yesterday", type: "homework" },
  { id: 3, title: "Mock Test Results Published", content: "Mock Test results are out. Top scorer: Arjun Sharma (278/300).", teacher: "Amit Gupta", time: "Mar 5", type: "test" },
];

const students = [
  { id: 1, name: "Arjun Sharma", roll: "JA-001", present: true },
  { id: 2, name: "Priya Verma", roll: "JA-002", present: false },
  { id: 3, name: "Rohan Mehta", roll: "JA-003", present: true },
  { id: 4, name: "Sneha Patel", roll: "JA-004", present: true },
  { id: 5, name: "Aditya Kumar", roll: "JA-005", present: false },
  { id: 6, name: "Kavya Singh", roll: "JA-006", present: true },
];

const tests = [
  { id: 1, name: "Unit Test 2 — Thermodynamics", date: "Feb 28, 2025", maxMarks: 100, score: 78, rank: 3 },
  { id: 2, name: "Mock Test — JEE Mains", date: "Feb 15, 2025", maxMarks: 300, score: 243, rank: 4 },
  { id: 3, name: "Unit Test 1 — Kinematics", date: "Feb 1, 2025", maxMarks: 100, score: 91, rank: 1 },
];

const homework = [
  { id: 1, title: "DPP Sheet 14 — Rotational Dynamics", uploadedBy: "Amit Gupta", due: "Tomorrow", status: "pending" },
  { id: 2, title: "DPP Sheet 13 — Gravitation", uploadedBy: "Amit Gupta", due: "Mar 5", status: "submitted" },
  { id: 3, title: "Exercise 8.3 — Textbook Problems", uploadedBy: "Amit Gupta", due: "Mar 3", status: "submitted" },
];

const rankings = [
  { rank: 1, name: "Arjun Sharma", score: 278, change: "up" },
  { rank: 2, name: "Sneha Patel", score: 265, change: "up" },
  { rank: 3, name: "Rohit Kumar", score: 251, change: "same" },
  { rank: 4, name: "Kavya Singh", score: 243, change: "down" },
  { rank: 5, name: "You", score: 232, change: "up", isSelf: true },
];

export default function BatchWorkspace() {
  const { id } = useParams<{ id: string }>();
  const batch = batchInfo[id || "jee-a"] || batchInfo["jee-a"];
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(chatMessages);
  const [attendance, setAttendance] = useState<Record<number, boolean>>(
    Object.fromEntries(students.map(s => [s.id, s.present]))
  );
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: "You", role: "Student",
      text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), self: true
    }]);
    setChatInput("");
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card flex items-center gap-3 px-4 h-14 flex-shrink-0">
        <Link to="/admin/batches">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center text-white text-xs font-bold">
          {batch.name.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-semibold text-sm leading-none">{batch.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{batch.teacher} · {batch.students} students</p>
        </div>
        <Badge variant="secondary" className="text-xs hidden sm:flex">{batch.course}</Badge>
        <div className="flex items-center gap-1 text-xs text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border/50 bg-card px-4 flex-shrink-0">
          <TabsList className="h-10 bg-transparent p-0 gap-1">
            {[
              { value: "chat", icon: MessageSquare, label: "Chat" },
              { value: "announcements", icon: Megaphone, label: "Announcements" },
              { value: "attendance", icon: CalendarCheck, label: "Attendance" },
              { value: "tests", icon: FlaskConical, label: "Tests" },
              { value: "homework", icon: BookOpen, label: "Homework" },
              { value: "rankings", icon: Trophy, label: "Rankings" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-10 px-3 gap-1.5 text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Chat */}
          <TabsContent value="chat" className="h-full flex flex-col m-0 data-[state=inactive]:hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i < chatMessages.length ? 0 : 0 }}
                  className={cn("flex gap-2.5", msg.self ? "flex-row-reverse" : "flex-row")}
                >
                  {!msg.self && (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5",
                      msg.role === "Teacher" ? "gradient-hero" : "bg-secondary border border-border"
                    )}>
                      <span className={msg.role === "Teacher" ? "" : "text-foreground"}>
                        {msg.sender.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                  )}
                  <div className={cn("max-w-xs lg:max-w-md", msg.self ? "items-end" : "items-start", "flex flex-col gap-0.5")}>
                    {!msg.self && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{msg.sender}</span>
                        <Badge variant="secondary" className={cn("text-xs px-1.5 py-0", msg.role === "Teacher" && "bg-primary-light text-primary border-primary/20")}>
                          {msg.role}
                        </Badge>
                      </div>
                    )}
                    <div className={cn(
                      "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.self
                        ? "gradient-hero text-white rounded-tr-sm"
                        : "bg-card border border-border/60 rounded-tl-sm"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border/50 p-3 bg-card flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                className="flex-1 h-9"
              />
              <Button onClick={sendMessage} size="icon" className="w-9 h-9 gradient-hero text-white border-0 hover:opacity-90 flex-shrink-0">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements" className="h-full overflow-y-auto m-0 p-4 data-[state=inactive]:hidden">
            <div className="max-w-2xl space-y-4">
              <Button className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2 mb-2">
                <Plus className="w-4 h-4" /> Post Announcement
              </Button>
              {announcements.map((ann, i) => (
                <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="p-4 shadow-card border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{ann.title}</span>
                          <Badge variant="secondary" className="text-xs">{ann.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{ann.content}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{ann.teacher}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ann.time}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Attendance */}
          <TabsContent value="attendance" className="h-full overflow-y-auto m-0 p-4 data-[state=inactive]:hidden">
            <div className="max-w-xl space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center shadow-card border-border/50">
                  <div className="text-xl font-display font-bold text-success">{presentCount}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </Card>
                <Card className="p-3 text-center shadow-card border-border/50">
                  <div className="text-xl font-display font-bold text-danger">{students.length - presentCount}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </Card>
                <Card className="p-3 text-center shadow-card border-border/50">
                  <div className={`text-xl font-display font-bold ${Math.round(presentCount / students.length * 100) >= 75 ? 'text-success' : 'text-danger'}`}>
                    {Math.round(presentCount / students.length * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </Card>
              </div>
              <Card className="shadow-card border-border/50 overflow-hidden">
                <div className="p-3 border-b border-border/50">
                  <p className="font-display font-semibold text-sm">Today's Attendance — March 8</p>
                </div>
                <div className="divide-y divide-border/40">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
                          {s.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.roll}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAttendance(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                          attendance[s.id]
                            ? "bg-success-light text-success hover:bg-success hover:text-white"
                            : "bg-danger-light text-danger hover:bg-danger hover:text-white"
                        )}
                      >
                        {attendance[s.id] ? <><CheckCircle2 className="w-3.5 h-3.5" />Present</> : <><XCircle className="w-3.5 h-3.5" />Absent</>}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border/50">
                  <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90 h-8 text-xs">
                    Save Attendance
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tests */}
          <TabsContent value="tests" className="h-full overflow-y-auto m-0 p-4 data-[state=inactive]:hidden">
            <div className="max-w-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold">Test History</h3>
                <Button size="sm" className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-1.5 h-8 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Test
                </Button>
              </div>
              {tests.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="p-4 shadow-card border-border/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center text-white text-xs font-bold">
                          #{t.id}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <CalendarCheck className="w-3 h-3" />{t.date} · Max: {t.maxMarks}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg">{t.score}<span className="text-sm text-muted-foreground">/{t.maxMarks}</span></p>
                        <Badge variant="secondary" className="text-xs">Rank #{t.rank}</Badge>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Score</span>
                        <span className={`text-xs font-semibold ${Math.round(t.score / t.maxMarks * 100) >= 75 ? 'text-success' : 'text-warning'}`}>
                          {Math.round(t.score / t.maxMarks * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${Math.round(t.score / t.maxMarks * 100) >= 75 ? 'bg-success' : 'bg-warning'}`}
                          style={{ width: `${Math.round(t.score / t.maxMarks * 100)}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Homework */}
          <TabsContent value="homework" className="h-full overflow-y-auto m-0 p-4 data-[state=inactive]:hidden">
            <div className="max-w-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold">Homework & DPP</h3>
                <Button size="sm" className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-1.5 h-8 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Upload DPP
                </Button>
              </div>
              {homework.map((hw, i) => (
                <motion.div key={hw.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="p-4 shadow-card border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{hw.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>{hw.uploadedBy}</span>
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> Due: {hw.due}</span>
                        </div>
                      </div>
                      <Badge className={`text-xs flex-shrink-0 ${hw.status === 'submitted' ? 'bg-success-light text-success border-success/20' : 'bg-accent-light text-accent border-accent/20'}`}>
                        {hw.status === 'submitted' ? 'Submitted' : 'Pending'}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Rankings */}
          <TabsContent value="rankings" className="h-full overflow-y-auto m-0 p-4 data-[state=inactive]:hidden">
            <div className="max-w-md space-y-4">
              <Card className="shadow-card border-border/50 overflow-hidden">
                <div className="gradient-hero p-5 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5" />
                    <span className="font-display font-bold text-lg">Batch Leaderboard</span>
                  </div>
                  <p className="text-white/70 text-sm">Based on last mock test scores</p>
                </div>
                <div className="divide-y divide-border/40">
                  {rankings.map((r, i) => (
                    <motion.div
                      key={r.rank}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5",
                        r.isSelf && "bg-primary-light/40 border-l-2 border-primary"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                        i === 0 ? "gradient-hero text-white" : i === 1 ? "bg-secondary text-foreground" : i === 2 ? "bg-accent-light text-accent" : "bg-muted text-muted-foreground text-xs"
                      )}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : r.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", r.isSelf && "text-primary font-bold")}>
                          {r.name} {r.isSelf && <span className="text-xs">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{r.score} marks</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {r.change === "up" && <span className="text-success text-xs">▲</span>}
                        {r.change === "down" && <span className="text-danger text-xs">▼</span>}
                        {r.change === "same" && <span className="text-muted-foreground text-xs">—</span>}
                        <span className="text-sm font-display font-bold">{r.score}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
