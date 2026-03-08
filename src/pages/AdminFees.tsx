import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, IndianRupee, CheckCircle2, XCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const feeData = [
  { id: 1, name: "Arjun Sharma", batch: "JEE Advanced A", amount: 12000, paid: 12000, due: 0, status: "paid", lastPaid: "Mar 1, 2025" },
  { id: 2, name: "Priya Verma", batch: "JEE Advanced A", amount: 12000, paid: 8000, due: 4000, status: "partial", lastPaid: "Feb 15, 2025" },
  { id: 3, name: "Rohan Mehta", batch: "NEET A", amount: 15000, paid: 0, due: 15000, status: "overdue", lastPaid: "Dec 2024" },
  { id: 4, name: "Sneha Patel", batch: "NEET A", amount: 15000, paid: 15000, due: 0, status: "paid", lastPaid: "Mar 3, 2025" },
  { id: 5, name: "Aditya Kumar", batch: "JEE Mains B", amount: 10000, paid: 5000, due: 5000, status: "partial", lastPaid: "Feb 20, 2025" },
  { id: 6, name: "Kavya Singh", batch: "Foundation 9th", amount: 8000, paid: 8000, due: 0, status: "paid", lastPaid: "Mar 5, 2025" },
  { id: 7, name: "Harsh Gupta", batch: "JEE Advanced A", amount: 12000, paid: 0, due: 12000, status: "overdue", lastPaid: "Jan 2025" },
  { id: 8, name: "Ananya Rao", batch: "NEET B", amount: 15000, paid: 15000, due: 0, status: "paid", lastPaid: "Mar 2, 2025" },
];

const summaryStats = [
  { label: "Total Collected", value: "₹4,28,000", sub: "This month", color: "success", icon: TrendingUp },
  { label: "Pending Dues", value: "₹1,12,000", sub: "From 23 students", color: "warning", icon: Clock },
  { label: "Overdue (>30d)", value: "₹68,000", sub: "From 8 students", color: "danger", icon: AlertTriangle },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: "Paid", color: "bg-success-light text-success border-success/20", icon: CheckCircle2 },
  partial: { label: "Partial", color: "bg-accent-light text-accent border-accent/20", icon: Clock },
  overdue: { label: "Overdue", color: "bg-danger-light text-danger border-danger/20", icon: XCircle },
};

export default function AdminFees() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = feeData.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.batch.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || f.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <DashboardLayout title="Fees">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="p-4 shadow-card border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    s.color === 'success' ? 'bg-success-light' : s.color === 'warning' ? 'bg-accent-light' : 'bg-danger-light'
                  }`}>
                    <s.icon className={`w-4 h-4 ${s.color === 'success' ? 'text-success' : s.color === 'warning' ? 'text-warning' : 'text-danger'}`} />
                  </div>
                </div>
                <div className="text-2xl font-display font-bold mb-0.5">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-2">
            {["all", "paid", "partial", "overdue"].map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className={`h-9 capitalize ${filter === f ? 'gradient-hero text-white border-0' : ''}`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="shadow-card border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60 border-b border-border/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Batch</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Total Fee</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">Paid</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Due</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((f, i) => {
                  const st = statusConfig[f.status];
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
                            {f.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{f.batch}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{f.batch}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium">₹{f.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm text-success font-medium">₹{f.paid.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${f.due > 0 ? 'text-danger' : 'text-muted-foreground'}`}>
                          {f.due > 0 ? `₹${f.due.toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`text-xs gap-1 ${st.color}`}>
                          <StatusIcon className="w-3 h-3" /> {st.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {f.due > 0 && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:text-primary">
                            Send Reminder
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
      </div>
    </DashboardLayout>
  );
}
