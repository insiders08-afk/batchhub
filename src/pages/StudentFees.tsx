import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeeRecord {
  id: string;
  description: string | null;
  amount: number;
  annual_amount: number | null;
  payment_frequency: string | null;
  paid: boolean;
  due_date: string | null;
  paid_date: string | null;
}

const FREQ_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-Yearly",
  annual: "Annual",
};

export default function StudentFees() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("fees")
        .select("id, description, amount, annual_amount, payment_frequency, paid, due_date, paid_date")
        .eq("student_id", user.id)
        .order("due_date", { ascending: true });

      setFees((data || []) as FeeRecord[]);
      setLoading(false);
    };
    load();
  }, []);

  const getFeeStatus = (fee: FeeRecord) => {
    if (fee.paid) return "paid";
    if (fee.due_date && new Date(fee.due_date) < new Date()) return "overdue";
    return "pending";
  };

  const totalPaid = fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
  const totalDue = fees.filter(f => !f.paid).reduce((s, f) => s + f.amount, 0);
  const overdueAmount = fees.filter(f => getFeeStatus(f) === "overdue").reduce((s, f) => s + f.amount, 0);

  const summaryStats = [
    { label: "Total Paid", value: `₹${totalPaid.toLocaleString("en-IN")}`, color: "text-success", bg: "bg-success-light", icon: TrendingUp },
    { label: "Pending", value: `₹${totalDue.toLocaleString("en-IN")}`, color: "text-accent", bg: "bg-accent-light", icon: Clock },
    { label: "Overdue", value: `₹${overdueAmount.toLocaleString("en-IN")}`, color: "text-danger", bg: "bg-danger-light", icon: AlertTriangle },
  ];

  const statusConfig = {
    paid: { label: "Paid", color: "bg-success-light text-success border-success/20", icon: CheckCircle2 },
    pending: { label: "Pending", color: "bg-accent-light text-accent border-accent/20", icon: Clock },
    overdue: { label: "Overdue", color: "bg-danger-light text-danger border-danger/20", icon: XCircle },
  };

  return (
    <DashboardLayout title="My Fees" role="student">
      <div className="space-y-5 max-w-2xl">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {summaryStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-4 text-center shadow-card border-border/50">
                <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className={`text-lg font-display font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <Card className="p-10 text-center shadow-card border-border/50">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading fees...</p>
          </Card>
        ) : fees.length === 0 ? (
          <Card className="p-10 text-center shadow-card border-border/50">
            <IndianRupee className="w-9 h-9 text-muted-foreground opacity-30 mx-auto mb-3" />
            <p className="font-semibold">No fee records</p>
            <p className="text-sm text-muted-foreground">No fee entries have been created for you yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {fees.map((fee, i) => {
              const status = getFeeStatus(fee);
              const st = statusConfig[status];
              const StatusIcon = st.icon;
              return (
                <motion.div key={fee.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 shadow-card border-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-sm">{fee.description || "Fee"}</p>
                          {fee.payment_frequency && (
                            <Badge variant="secondary" className="text-xs">{FREQ_LABELS[fee.payment_frequency] || fee.payment_frequency}</Badge>
                          )}
                        </div>
                        {fee.annual_amount && (
                          <p className="text-xs text-muted-foreground mb-1">Annual package: ₹{Number(fee.annual_amount).toLocaleString("en-IN")}</p>
                        )}
                        {!fee.paid && fee.due_date && (
                          <p className={`text-xs font-medium ${status === "overdue" ? "text-danger" : "text-muted-foreground"}`}>
                            {status === "overdue" ? "⚠ Overdue since " : "Due by "}
                            {new Date(fee.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        )}
                        {fee.paid && fee.paid_date && (
                          <p className="text-xs text-success font-medium">
                            ✓ Paid on {new Date(fee.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-base font-display font-bold">₹{Number(fee.amount).toLocaleString("en-IN")}</p>
                        <Badge className={`text-xs gap-1 ${st.color}`}>
                          <StatusIcon className="w-3 h-3" /> {st.label}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {fees.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pb-2">
            This is a read-only view. Contact your institute admin for any fee-related queries.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
