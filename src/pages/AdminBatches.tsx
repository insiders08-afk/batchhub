import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Users, BookOpen, Clock, Pencil, Trash2, ExternalLink, Loader2, UserPlus, X, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const courses = ["JEE", "NEET", "Foundation", "CUET", "Other"];

interface Batch {
  id: string;
  name: string;
  course: string;
  teacher_name: string | null;
  schedule: string | null;
  is_active: boolean;
  institute_code: string;
  studentCount: number;
}

interface Teacher {
  user_id: string;
  full_name: string;
}

interface Student {
  user_id: string;
  full_name: string;
  email: string;
  enrolled?: boolean;
}

// ---- Enroll Students Dialog ----
function EnrollStudentsDialog({ batch, instituteCode, onDone }: { batch: Batch; instituteCode: string; onDone: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    // Get all approved students in this institute
    const { data: allStudents } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .eq("institute_code", instituteCode)
      .eq("role", "student")
      .in("status", ["approved", "active"]);

    // Get already enrolled students in this batch
    const { data: enrolled } = await supabase
      .from("students_batches")
      .select("student_id")
      .eq("batch_id", batch.id);

    const enrolledIds = new Set((enrolled || []).map(e => e.student_id));

    setStudents(
      (allStudents || []).map(s => ({ ...s, enrolled: enrolledIds.has(s.user_id) }))
    );
    setLoading(false);
  };

  useEffect(() => {
    if (open) loadStudents();
  }, [open]);

  const handleEnroll = async (student: Student) => {
    setEnrolling(student.user_id);
    const { error } = await supabase.from("students_batches").insert({
      batch_id: batch.id,
      student_id: student.user_id,
      institute_code: instituteCode,
    });
    if (error) {
      toast({ title: "Error enrolling student", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${student.full_name} enrolled in ${batch.name}!` });
      setStudents(prev => prev.map(s => s.user_id === student.user_id ? { ...s, enrolled: true } : s));
      onDone();
    }
    setEnrolling(null);
  };

  const handleUnenroll = async (student: Student) => {
    setEnrolling(student.user_id);
    const { error } = await supabase
      .from("students_batches")
      .delete()
      .eq("batch_id", batch.id)
      .eq("student_id", student.user_id);
    if (error) {
      toast({ title: "Error removing student", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${student.full_name} removed from ${batch.name}` });
      setStudents(prev => prev.map(s => s.user_id === student.user_id ? { ...s, enrolled: false } : s));
      onDone();
    }
    setEnrolling(null);
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  const enrolled = students.filter(s => s.enrolled);
  const notEnrolled = filtered.filter(s => !s.enrolled);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-8 text-xs gap-1.5 border-border/50 hover:border-primary/30 hover:text-primary">
          <UserPlus className="w-3 h-3" /> Enroll Students
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display">Enroll Students — {batch.name}</DialogTitle>
        </DialogHeader>

        {/* Enrolled count */}
        <div className="flex items-center gap-2 px-1">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{enrolled.length}</span> student{enrolled.length !== 1 ? "s" : ""} enrolled
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">No approved students yet</p>
            <p className="text-xs mt-1">Approve students from the Approvals page first</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 space-y-1 pr-1">
            {/* Already enrolled section */}
            {enrolled.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1 px-1">Enrolled</p>
                {enrolled.filter(s =>
                  s.full_name.toLowerCase().includes(search.toLowerCase()) ||
                  s.email.toLowerCase().includes(search.toLowerCase())
                ).map(s => (
                  <div key={s.user_id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-success/5 border border-success/15 mb-1">
                    <div>
                      <p className="text-sm font-medium">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-danger"
                      disabled={enrolling === s.user_id}
                      onClick={() => handleUnenroll(s)}
                    >
                      {enrolling === s.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Not enrolled */}
            {notEnrolled.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">Not Enrolled</p>
                {notEnrolled.map(s => (
                  <div key={s.user_id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all mb-1">
                    <div>
                      <p className="text-sm font-medium">{s.full_name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1 gradient-hero text-white border-0 hover:opacity-90"
                      disabled={enrolling === s.user_id}
                      onClick={() => handleEnroll(s)}
                    >
                      {enrolling === s.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                      Enroll
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {filtered.length === 0 && search && (
              <p className="text-center text-sm text-muted-foreground py-6">No students match "{search}"</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Page ----
export default function AdminBatches() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instituteCode, setInstituteCode] = useState("");

  const [newBatch, setNewBatch] = useState({ name: "", course: "", teacherId: "", teacherName: "", schedule: "" });

  const fetchBatches = async (code: string) => {
    const { data } = await supabase
      .from("batches")
      .select("*")
      .eq("institute_code", code)
      .order("created_at", { ascending: false });

    if (!data) return;

    const enriched = await Promise.all(
      data.map(async (b) => {
        const { count } = await supabase
          .from("students_batches")
          .select("id", { count: "exact" })
          .eq("batch_id", b.id);
        return { ...b, studentCount: count || 0 };
      })
    );
    setBatches(enriched);
  };

  useEffect(() => {
    const init = async () => {
      const { data: code } = await supabase.rpc("get_my_institute_code");
      if (!code) { setLoading(false); return; }
      setInstituteCode(code);

      const { data: teacherData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("institute_code", code)
        .eq("role", "teacher")
        .in("status", ["approved", "active"]);
      setTeachers(teacherData || []);

      await fetchBatches(code);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreate = async () => {
    if (!newBatch.name || !newBatch.course) {
      toast({ title: "Please fill in batch name and course", variant: "destructive" });
      return;
    }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Insert batch WITHOUT teacher_id initially — teacher must accept first
    const { data: batchData, error } = await supabase.from("batches").insert({
      name: newBatch.name,
      course: newBatch.course,
      schedule: newBatch.schedule || null,
      teacher_id: null,
      teacher_name: null,
      institute_code: instituteCode,
      is_active: true,
    }).select("id").single();

    if (error) {
      toast({ title: "Error creating batch", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    // If a teacher was selected, send them a batch assignment request
    if (newBatch.teacherId && batchData && user) {
      await supabase.from("batch_teacher_requests").insert({
        batch_id: batchData.id,
        teacher_id: newBatch.teacherId,
        institute_code: instituteCode,
        requested_by: user.id,
        batch_name: newBatch.name,
        course: newBatch.course,
        status: "pending",
      });
      toast({ title: "Batch created!", description: `Assignment request sent to ${newBatch.teacherName}. They must accept to be linked.` });
    } else {
      toast({ title: "Batch created successfully!" });
    }

    setDialogOpen(false);
    setNewBatch({ name: "", course: "", teacherId: "", teacherName: "", schedule: "" });
    await fetchBatches(instituteCode);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this batch? This cannot be undone.")) return;
    const { error } = await supabase.from("batches").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting batch", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Batch deleted" });
      setBatches(prev => prev.filter(b => b.id !== id));
    }
  };

  const filtered = batches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Batches">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" /> Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Create New Batch</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Batch Name</Label>
                  <Input
                    placeholder="e.g. JEE Advanced 2025 – A"
                    value={newBatch.name}
                    onChange={e => setNewBatch(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Course</Label>
                  <Select onValueChange={v => setNewBatch(p => ({ ...p, course: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned Teacher</Label>
                  <Select onValueChange={v => {
                    const t = teachers.find(t => t.user_id === v);
                    setNewBatch(p => ({ ...p, teacherId: v, teacherName: t?.full_name || "" }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger>
                    <SelectContent>
                      {teachers.length === 0
                        ? <SelectItem value="none" disabled>No approved teachers yet</SelectItem>
                        : teachers.map(t => <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Schedule</Label>
                  <Input
                    placeholder="e.g. Mon, Wed, Fri — 8:00 AM"
                    value={newBatch.schedule}
                    onChange={e => setNewBatch(p => ({ ...p, schedule: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90"
                  onClick={handleCreate}
                  disabled={saving}
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Batch"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{batches.length === 0 ? "No batches yet" : "No batches match your search"}</p>
            {batches.length === 0 && <p className="text-sm mt-1">Create your first batch to get started</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((batch, i) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-all hover:-translate-y-0.5 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {batch.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-sm leading-tight">{batch.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-0.5">{batch.course}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7"><Pencil className="w-3 h-3" /></Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(batch.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{batch.teacher_name || "No teacher assigned"}</span>
                    </div>
                    {batch.schedule && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{batch.schedule}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{batch.studentCount} student{batch.studentCount !== 1 ? "s" : ""} enrolled</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <EnrollStudentsDialog
                      batch={batch}
                      instituteCode={instituteCode}
                      onDone={() => fetchBatches(instituteCode)}
                    />
                    <Link to={`/batch/${batch.id}`}>
                      <Button variant="outline" className="w-full h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary-light">
                        Open Batch Workspace <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
