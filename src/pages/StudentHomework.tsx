import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Paperclip, Loader2, CalendarDays, Clock, ExternalLink, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Homework {
  id: string;
  title: string;
  description: string | null;
  type: string;
  batch_id: string;
  teacher_name: string | null;
  file_url: string | null;
  file_name: string | null;
  due_date: string | null;
  created_at: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h >= 48) return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (h >= 24) return "Yesterday";
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

export default function StudentHomework() {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"homework" | "dpp">("homework");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: enrollments } = await supabase
        .from("students_batches").select("batch_id").eq("student_id", user.id);
      const batchIds = (enrollments || []).map(e => e.batch_id);

      if (batchIds.length === 0) { setLoading(false); return; }

      const [hwRes, batchRes] = await Promise.all([
        supabase.from("homeworks").select("*").in("batch_id", batchIds).order("created_at", { ascending: false }),
        supabase.from("batches").select("id, name").in("id", batchIds),
      ]);

      setHomeworks((hwRes.data || []) as Homework[]);
      setBatches(batchRes.data || []);
      setLoading(false);
    };
    init();
  }, []);

  const getBatchName = (batchId: string) => batches.find(b => b.id === batchId)?.name || "";

  const filtered = homeworks.filter(h =>
    h.type === activeTab &&
    (h.title.toLowerCase().includes(search.toLowerCase()) || (h.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <DashboardLayout title="Homework / DPP" role="student">
      <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Homework / DPP" role="student">
      <div className="space-y-5 max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "homework" | "dpp")}>
            <TabsList className="h-9">
              <TabsTrigger value="homework" className="gap-1.5"><BookOpen className="w-3.5 h-3.5" />Homework</TabsTrigger>
              <TabsTrigger value="dpp" className="gap-1.5"><FileText className="w-3.5 h-3.5" />DPP</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-10 text-center shadow-card border-border/50">
            {activeTab === "dpp" ? <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" /> : <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />}
            <p className="font-semibold">No {activeTab === "dpp" ? "DPPs" : "homework"} yet</p>
            <p className="text-muted-foreground text-sm mt-1">Your teacher hasn't posted any {activeTab === "dpp" ? "DPPs" : "homework"} yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((hw, i) => (
              <motion.div key={hw.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                      {hw.type === "dpp" ? <FileText className="w-4 h-4 text-white" /> : <BookOpen className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{hw.title}</h3>
                        <Badge className="text-xs bg-primary-light text-primary border-primary/20">
                          {getBatchName(hw.batch_id)}
                        </Badge>
                      </div>
                      {hw.description && <p className="text-sm text-muted-foreground mb-2">{hw.description}</p>}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(hw.created_at)}</span>
                        {hw.due_date && (
                          <span className={`flex items-center gap-1 font-medium ${new Date(hw.due_date) < new Date() ? "text-danger" : "text-warning"}`}>
                            <CalendarDays className="w-3 h-3" />Due: {new Date(hw.due_date).toLocaleDateString("en-IN")}
                          </span>
                        )}
                        <span>by {hw.teacher_name || "Teacher"}</span>
                        {hw.file_name && (
                          <a href={hw.file_url!} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-medium">
                            <Paperclip className="w-3 h-3" />{hw.file_name} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
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
