import { useState, useRef, useEffect, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  MessageSquare, Megaphone, CalendarCheck, FlaskConical,
  BookOpen, Trophy, ArrowLeft, Send, Plus, CheckCircle2,
  XCircle, Clock, Users, Loader2, Star, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BatchInfo {
  id: string;
  name: string;
  course: string;
  teacher_name: string | null;
  institute_code: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
  isSelf?: boolean;
}

interface Student {
  id: string;
  user_id: string;
  full_name: string;
  present?: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  posted_by_name: string | null;
  created_at: string;
  type: string | null;
}

interface TestScore {
  id: string;
  test_name: string;
  test_date: string;
  score: number;
  max_marks: number;
  student_id: string;
}

export default function BatchWorkspace() {
  const { id: batchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("student");
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Attendance
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annDialog, setAnnDialog] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", content: "", type: "general" });
  const [savingAnn, setSavingAnn] = useState(false);

  // Tests
  const [tests, setTests] = useState<TestScore[]>([]);
  const [testDialog, setTestDialog] = useState(false);
  const [newTest, setNewTest] = useState({ name: "", maxMarks: "100", studentId: "", score: "" });
  const [savingTest, setSavingTest] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!batchId) return;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setCurrentUserName(profile.full_name);
        setCurrentUserRole(profile.role);
      }

      // Batch info
      const { data: batchData } = await supabase
        .from("batches")
        .select("*")
        .eq("id", batchId)
        .single();
      if (batchData) setBatch(batchData);

      // Student count
      const { count } = await supabase
        .from("students_batches")
        .select("id", { count: "exact" })
        .eq("batch_id", batchId);
      setStudentCount(count || 0);

      // Chat messages
      const { data: msgs } = await supabase
        .from("batch_messages")
        .select("*")
        .eq("batch_id", batchId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (msgs) {
        setMessages(msgs.map(m => ({ ...m, isSelf: m.sender_id === user.id })));
      }

      // Enrolled students
      const { data: enrollments } = await supabase
        .from("students_batches")
        .select("student_id")
        .eq("batch_id", batchId);

      if (enrollments && enrollments.length > 0) {
        const ids = enrollments.map(e => e.student_id);
        const { data: studentProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", ids);
        const mapped = (studentProfiles || []).map(s => ({ id: s.user_id, user_id: s.user_id, full_name: s.full_name }));
        setStudents(mapped);
        setAttendance(Object.fromEntries(mapped.map(s => [s.id, false])));
      }

      // Announcements
      const { data: anns } = await supabase
        .from("announcements")
        .select("*")
        .eq("batch_id", batchId)
        .order("created_at", { ascending: false });
      setAnnouncements(anns || []);

      // Tests
      const { data: testData } = await supabase
        .from("test_scores")
        .select("*")
        .eq("batch_id", batchId)
        .order("test_date", { ascending: false });
      setTests(testData || []);

      setLoading(false);
    };
    init();
  }, [batchId]);

  // Realtime chat subscription
  useEffect(() => {
    if (!batchId) return;
    const channel = supabase
      .channel(`batch-chat-${batchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "batch_messages", filter: `batch_id=eq.${batchId}` },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, { ...msg, isSelf: msg.sender_id === currentUserId }];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [batchId, currentUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !batch) return;
    setSendingMsg(true);
    const { error } = await supabase.from("batch_messages").insert({
      batch_id: batchId!,
      institute_code: batch.institute_code,
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_role: currentUserRole,
      message: chatInput.trim(),
    });
    if (!error) setChatInput("");
    setSendingMsg(false);
  };

  const saveAttendance = async () => {
    if (!batch) return;
    setSavingAttendance(true);
    const today = new Date().toISOString().split("T")[0];

    // Upsert attendance for each student
    const rows = students.map(s => ({
      batch_id: batchId!,
      institute_code: batch.institute_code,
      student_id: s.user_id,
      present: attendance[s.id] || false,
      date: today,
      marked_by: currentUserId,
    }));

    const { error } = await supabase.from("attendance").upsert(rows, {
      onConflict: "batch_id,student_id,date",
    });

    if (error) {
      toast({ title: "Error saving attendance", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Attendance saved!", description: `Saved for ${today}` });
    }
    setSavingAttendance(false);
  };

  const postAnnouncement = async () => {
    if (!newAnn.title || !newAnn.content || !batch) return;
    setSavingAnn(true);
    const { error } = await supabase.from("announcements").insert({
      batch_id: batchId!,
      institute_code: batch.institute_code,
      posted_by: currentUserId,
      posted_by_name: currentUserName,
      title: newAnn.title,
      content: newAnn.content,
      type: newAnn.type,
    });
    if (error) {
      toast({ title: "Error posting announcement", variant: "destructive" });
    } else {
      toast({ title: "Announcement posted!" });
      setAnnDialog(false);
      setNewAnn({ title: "", content: "", type: "general" });
      const { data } = await supabase.from("announcements").select("*").eq("batch_id", batchId!).order("created_at", { ascending: false });
      setAnnouncements(data || []);
    }
    setSavingAnn(false);
  };

  const addTest = async () => {
    if (!newTest.name || !newTest.studentId || !newTest.score || !batch) return;
    setSavingTest(true);
    const { error } = await supabase.from("test_scores").insert({
      batch_id: batchId!,
      institute_code: batch.institute_code,
      student_id: newTest.studentId,
      test_name: newTest.name,
      score: Number(newTest.score),
      max_marks: Number(newTest.maxMarks),
    });
    if (error) {
      toast({ title: "Error adding test score", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Test score added!" });
      setTestDialog(false);
      setNewTest({ name: "", maxMarks: "100", studentId: "", score: "" });
      const { data } = await supabase.from("test_scores").select("*").eq("batch_id", batchId!).order("test_date", { ascending: false });
      setTests(data || []);
    }
    setSavingTest(false);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Batch not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card flex items-center gap-3 px-4 h-14 flex-shrink-0">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center text-white text-xs font-bold">
          {batch.name.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-semibold text-sm leading-none">{batch.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {batch.teacher_name || "No teacher"} · {studentCount} students
          </p>
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
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2.5", msg.isSelf ? "flex-row-reverse" : "flex-row")}
                >
                  {!msg.isSelf && (
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5",
                      msg.sender_role === "teacher" || msg.sender_role === "admin" ? "gradient-hero" : "bg-secondary border border-border"
                    )}>
                      <span className={msg.sender_role === "teacher" || msg.sender_role === "admin" ? "" : "text-foreground"}>
                        {msg.sender_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div className={cn("max-w-xs lg:max-w-md", msg.isSelf ? "items-end" : "items-start", "flex flex-col gap-0.5")}>
                    {!msg.isSelf && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{msg.sender_name}</span>
                        <Badge variant="secondary" className={cn("text-xs px-1.5 py-0", (msg.sender_role === "teacher" || msg.sender_role === "admin") && "bg-primary-light text-primary border-primary/20")}>
                          {msg.sender_role}
                        </Badge>
                      </div>
                    )}
                    <div className={cn(
                      "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.isSelf
                        ? "gradient-hero text-white rounded-tr-sm"
                        : "bg-card border border-border/60 rounded-tl-sm"
                    )}>
                      {msg.message}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
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
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1 h-9"
              />
              <Button
                onClick={sendMessage}
                size="icon"
                disabled={sendingMsg || !chatInput.trim()}
                className="w-9 h-9 gradient-hero text-white border-0 hover:opacity-90 flex-shrink-0"
              >
                {sendingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </TabsContent>

          {/* Announcements */}
          <TabsContent value="announcements" className="h-full overflow-y-auto m-0 p-4 data-[state=inactive]:hidden">
            <div className="max-w-2xl space-y-4">
              {(currentUserRole === "teacher" || currentUserRole === "admin") && (
                <Dialog open={annDialog} onOpenChange={setAnnDialog}>
                  <DialogTrigger asChild>
                    <Button className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2 mb-2">
                      <Plus className="w-4 h-4" /> Post Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-display">New Announcement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input placeholder="e.g. Unit Test 3 Schedule" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Message</Label>
                        <Textarea placeholder="Write your announcement..." value={newAnn.content} onChange={e => setNewAnn(p => ({ ...p, content: e.target.value }))} rows={3} />
                      </div>
                      <Button className="w-full gradient-hero text-white border-0 hover:opacity-90" onClick={postAnnouncement} disabled={savingAnn}>
                        {savingAnn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Post
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No announcements yet.</p>
              ) : (
                announcements.map((ann, i) => (
                  <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="p-4 shadow-card border-border/50">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{ann.title}</span>
                            {ann.type && <Badge variant="secondary" className="text-xs">{ann.type}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">{ann.content}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{ann.posted_by_name}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(ann.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
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
                  <div className={`text-xl font-display font-bold ${students.length > 0 && Math.round(presentCount / students.length * 100) >= 75 ? "text-success" : "text-danger"}`}>
                    {students.length > 0 ? `${Math.round(presentCount / students.length * 100)}%` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </Card>
              </div>
              {students.length === 0 ? (
                <Card className="p-8 text-center shadow-card border-border/50">
                  <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">No students enrolled in this batch yet.</p>
                </Card>
              ) : (
                <Card className="shadow-card border-border/50 overflow-hidden">
                  <div className="p-3 border-b border-border/50">
                    <p className="font-display font-semibold text-sm">
                      Today's Attendance — {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <div className="divide-y divide-border/40">
                    {students.map(s => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
                            {s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <p className="text-sm font-medium">{s.full_name}</p>
                        </div>
                        {(currentUserRole === "teacher" || currentUserRole === "admin") ? (
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
                        ) : (
                          <Badge className={attendance[s.id] ? "bg-success-light text-success border-success/20 text-xs" : "bg-danger-light text-danger border-danger/20 text-xs"}>
                            {attendance[s.id] ? "Present" : "Absent"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  {(currentUserRole === "teacher" || currentUserRole === "admin") && (
                    <div className="p-3 border-t border-border/50">
                      <Button
                        className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90 h-8 text-xs"
                        onClick={saveAttendance}
                        disabled={savingAttendance}
                      >
                        {savingAttendance ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />Saving...</> : "Save Attendance"}
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tests */}
          <TabsContent value="tests" className="h-full overflow-y-auto m-0 p-4 data-[state=inactive]:hidden">
            <div className="max-w-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold">Test Scores</h3>
                {(currentUserRole === "teacher" || currentUserRole === "admin") && (
                  <Dialog open={testDialog} onOpenChange={setTestDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-1.5 h-8 text-xs">
                        <Plus className="w-3.5 h-3.5" /> Add Score
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-display">Add Test Score</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <Label>Test Name</Label>
                          <Input placeholder="e.g. Unit Test 3 — Thermodynamics" value={newTest.name} onChange={e => setNewTest(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Max Marks</Label>
                            <Input type="number" value={newTest.maxMarks} onChange={e => setNewTest(p => ({ ...p, maxMarks: e.target.value }))} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Score</Label>
                            <Input type="number" value={newTest.score} onChange={e => setNewTest(p => ({ ...p, score: e.target.value }))} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Student</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={newTest.studentId}
                            onChange={e => setNewTest(p => ({ ...p, studentId: e.target.value }))}
                          >
                            <option value="">Select student</option>
                            {students.map(s => <option key={s.user_id} value={s.user_id}>{s.full_name}</option>)}
                          </select>
                        </div>
                        <Button className="w-full gradient-hero text-white border-0 hover:opacity-90" onClick={addTest} disabled={savingTest}>
                          {savingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Score
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {tests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No test scores yet.</p>
              ) : (
                tests.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Card className="p-4 shadow-card border-border/50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center text-white text-xs font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{t.test_name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(t.test_date).toLocaleDateString("en-IN")} · Max: {t.max_marks}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-lg">{t.score}<span className="text-sm text-muted-foreground">/{t.max_marks}</span></p>
                          <p className={`text-xs font-semibold ${Math.round(t.score / t.max_marks * 100) >= 75 ? "text-success" : "text-warning"}`}>
                            {Math.round(t.score / t.max_marks * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${Math.round(t.score / t.max_marks * 100) >= 75 ? "bg-success" : "bg-warning"}`}
                            style={{ width: `${Math.round(t.score / t.max_marks * 100)}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
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
                  <p className="text-white/70 text-sm">Based on latest test scores</p>
                </div>
                {tests.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No test scores yet to rank.</div>
                ) : (() => {
                  // Aggregate scores by student
                  const byStudent: Record<string, { name: string; total: number; count: number }> = {};
                  tests.forEach(t => {
                    const s = students.find(s => s.user_id === t.student_id);
                    const name = s?.full_name || "Unknown";
                    if (!byStudent[t.student_id]) byStudent[t.student_id] = { name, total: 0, count: 0 };
                    byStudent[t.student_id].total += Math.round(t.score / t.max_marks * 100);
                    byStudent[t.student_id].count += 1;
                  });
                  const ranked = Object.entries(byStudent)
                    .map(([id, v]) => ({ id, name: v.name, avg: Math.round(v.total / v.count) }))
                    .sort((a, b) => b.avg - a.avg);
                  return (
                    <div className="divide-y divide-border/40">
                      {ranked.map((r, i) => (
                        <div key={r.id} className={cn("flex items-center gap-3 px-4 py-3.5", r.id === currentUserId && "bg-primary-light/40 border-l-2 border-primary")}>
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
                            i === 0 ? "gradient-hero text-white" : i === 1 ? "bg-secondary text-foreground" : i === 2 ? "bg-accent-light text-accent" : "bg-muted text-muted-foreground text-xs"
                          )}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium", r.id === currentUserId && "text-primary font-bold")}>
                              {r.name} {r.id === currentUserId && <span className="text-xs">(You)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg: {r.avg}%</p>
                          </div>
                          <span className="text-sm font-display font-bold">{r.avg}%</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
