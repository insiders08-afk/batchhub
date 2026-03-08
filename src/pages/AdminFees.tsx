import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, CheckCircle2, XCircle, Clock, AlertTriangle,
  TrendingUp, Plus, IndianRupee, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Fee = Tables<"fees"> & { student_name?: string };
type Profile = { user_id: string; full_name: string };

export default function AdminFees() {
  const { toast } = useToast();
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const [newFee, setNewFee] = useState({
    student_id: "", amount: "", description: "", due_date: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get institute code
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("institute_code")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      const instituteCode = roleData?.institute_code;
      if (!instituteCode) return;

      // Fetch students for this institute
      const { data: studentData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("institute_code", instituteCode)
        .eq("role", "student")
        .eq("status", "approved");

      setStudents(studentData || []);

      // Fetch fees
      const { data: feeData, error } = await supabase
        .from("fees")
        .select("*")
        .eq("institute_code", instituteCode)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map student names
      const studentMap = new Map((studentData || []).map(s => [s.user_id, s.full_name]));
      const enriched: Fee[] = (feeData || []).map(f => ({
        ...f,
        student_name: studentMap.get(f.student_id) || "Unknown Student",
      }));

      setFees(enriched);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load fees", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddFee = async () => {
    if (!newFee.student_id || !newFee.amount) {
      toast({ title: "Required", description: "Please select a student and enter an amount.", variant: "destructive" });
      return;
    }
    setAddLoading(true);
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("institute_code")
        .eq("role", "admin")
        .single();

      const { error } = await supabase.from("fees").insert({
        student_id: newFee.student_id,
        amount: parseFloat(newFee.amount),
        description: newFee.description || null,
        due_date: newFee.due_date || null,
        institute_code: roleData?.institute_code || "",
        paid: false,
      });
      if (error) throw error;

      toast({ title: "Fee added", description: "Fee entry created successfully." });
      setShowAdd(false);
      setNewFee({ student_id: "", amount: "", description: "", due_date: "" });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add fee";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setAddLoading(false);
    }
  };

  const handleMarkPaid = async (fee: Fee) => {
    setMarkingId(fee.id);
    try {
      const { error } = await supabase
        .from("fees")
        .update({ paid: true, paid_date: new Date().toISOString().split("T")[0] })
        .eq("id", fee.id);
      if (error) throw error;
      toast({ title: "Marked as Paid", description: `Fee for ${fee.student_name} marked paid.` });
      setFees(prev => prev.map(f => f.id === fee.id ? { ...f, paid: true, paid_date: new Date().toISOString().split("T")[0] } : f));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setMarkingId(null);
    }
  };

  const getFeeStatus = (fee: Fee) => {
    if (fee.paid) return "paid";
    if (fee.due_date && new Date(fee.due_date) < new Date()) return "overdue";
    return "pending";
  };

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    paid: { label: "Paid", color: "bg-success-light text-success border-success/20", icon: CheckCircle2 },
    pending: { label: "Pending", color: "bg-accent-light text-accent border-accent/20", icon: Clock },
    overdue: { label: "Overdue", color: "bg-danger-light text-danger border-danger/20", icon: XCircle },
  };

  const filtered = fees.filter(f => {
    const matchSearch = f.student_name?.toLowerCase().includes(search.toLowerCase())
      || f.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || getFeeStatus(f) === filter;
    return matchSearch && matchFilter;
  });

  const totalCollected = fees.filter(f => f.paid).reduce((s, f) => s + Number(f.amount), 0);
  const totalPending = fees.filter(f => !f.paid).reduce((s, f) => s + Number(f.amount), 0);
  const overdueCount = fees.filter(f => getFeeStatus(f) === "overdue").length;
  const overdueAmount = fees.filter(f => getFeeStatus(f) === "overdue").reduce((s, f) => s + Number(f.amount), 0);

  const summaryStats = [
    { label: "Total Collected", value: `₹${totalCollected.toLocaleString("en-IN")}`, sub: `${fees.filter(f => f.paid).length} payments`, color: "success", icon: TrendingUp },
    { label: "Pending Dues", value: `₹${totalPending.toLocaleString("en-IN")}`, sub: `${fees.filter(f => !f.paid).length} entries`, color: "warning", icon: Clock },
    { label: "Overdue", value: `₹${overdueAmount.toLocaleString("en-IN")}`, sub: `${overdueCount} entries`, color: "danger", icon: AlertTriangle },
  ];

  return (
    <DashboardLayout title="Fees">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-4 shadow-card border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color === "success" ? "bg-success-light" : s.color === "warning" ? "bg-accent-light" : "bg-danger-light"}`}>
                    <s.icon className={`w-4 h-4 ${s.color === "success" ? "text-success" : s.color === "warning" ? "text-accent" : "text-danger"}`} />
                  </div>
                </div>
                <div className="text-2xl font-display font-bold mb-0.5">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters + Add button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-2 flex-wrap flex-1">
            {["all", "paid", "pending", "overdue"].map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className={`h-9 capitalize ${filter === f ? "gradient-hero text-white border-0" : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            className="h-9 gradient-hero text-white border-0 gap-1.5"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="w-4 h-4" /> Add Fee
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <Card className="p-10 text-center shadow-card border-border/50">
            <Loader2 className="w-7 h-7 text-primary mx-auto mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading fees...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center shadow-card border-border/50">
            <IndianRupee className="w-9 h-9 text-muted-foreground opacity-30 mx-auto mb-3" />
            <p className="font-semibold">No fee records</p>
            <p className="text-sm text-muted-foreground">Add fee entries using the "Add Fee" button above.</p>
          </Card>
        ) : (
          <Card className="shadow-card border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/60 border-b border-border/50">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Student</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Description</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">Due Date</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map((f, i) => {
                    const status = getFeeStatus(f);
                    const st = statusConfig[status];
                    const StatusIcon = st.icon;
                    return (
                      <motion.tr
                        key={f.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {f.student_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </div>
                            <p className="text-sm font-medium">{f.student_name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{f.description || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium">₹{Number(f.amount).toLocaleString("en-IN")}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-sm ${status === "overdue" ? "text-danger font-medium" : "text-muted-foreground"}`}>
                            {f.due_date ? new Date(f.due_date).toLocaleDateString("en-IN") : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`text-xs gap-1 ${st.color}`}>
                            <StatusIcon className="w-3 h-3" /> {st.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!f.paid && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-success hover:text-success"
                              disabled={markingId === f.id}
                              onClick={() => handleMarkPaid(f)}
                            >
                              {markingId === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark Paid"}
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Add Fee Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fee Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Select value={newFee.student_id} onValueChange={v => setNewFee({ ...newFee, student_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.user_id} value={s.user_id}>{s.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="e.g. 12000"
                value={newFee.amount}
                onChange={e => setNewFee({ ...newFee, amount: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="e.g. Monthly tuition fee"
                value={newFee.description}
                onChange={e => setNewFee({ ...newFee, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newFee.due_date}
                onChange={e => setNewFee({ ...newFee, due_date: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleAddFee} disabled={addLoading} className="flex-1 gradient-hero text-white border-0">
                {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Fee"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
