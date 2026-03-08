import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Zap, Shield, CheckCircle2, XCircle, Clock, Search,
  Building2, LogOut, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Institute = Tables<"institutes">;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1) return `${h}h ago`;
  return `${Math.floor(diff / 60000)}m ago`;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Guard: only super_admin
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth/admin"); return; }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (!roleData) { navigate("/"); return; }
      setChecking(false);
      fetchInstitutes();
    };
    checkAccess();
  }, [navigate]);

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("institutes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInstitutes(data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (inst: Institute, action: "approved" | "rejected") => {
    setActionLoading(inst.id);
    try {
      const { error: instError } = await supabase
        .from("institutes")
        .update({ status: action })
        .eq("id", inst.id);
      if (instError) throw instError;

      if (action === "approved" && inst.owner_user_id) {
        // Grant admin role
        const { error: roleError } = await supabase.from("user_roles").upsert({
          user_id: inst.owner_user_id,
          role: "admin",
          institute_code: inst.institute_code,
        }, { onConflict: "user_id,role" });
        if (roleError) throw roleError;

        // Update profile status
        await supabase.from("profiles")
          .update({ status: "approved" })
          .eq("user_id", inst.owner_user_id);

        toast({ title: "✅ Approved!", description: `${inst.institute_name} is now live on Lamba.` });
      } else {
        if (inst.owner_user_id) {
          await supabase.from("profiles")
            .update({ status: "rejected" })
            .eq("user_id", inst.owner_user_id);
        }
        toast({ title: "Rejected", description: `${inst.institute_name} registration has been rejected.` });
      }

      setInstitutes((prev) =>
        prev.map((i) => i.id === inst.id ? { ...i, status: action } : i)
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Action failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filtered = institutes.filter((inst) => {
    const matchesFilter = filter === "all" || inst.status === filter;
    const matchesSearch =
      inst.institute_name.toLowerCase().includes(search.toLowerCase()) ||
      inst.institute_code.toLowerCase().includes(search.toLowerCase()) ||
      inst.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      inst.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = institutes.filter((i) => i.status === "pending").length;
  const approvedCount = institutes.filter((i) => i.status === "approved").length;

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-card sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-gradient">Lamba</span>
            <Badge className="bg-primary-light text-primary border-0 text-xs ml-1">Super Admin</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchInstitutes} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Institute Control Panel</h1>
              <p className="text-muted-foreground text-sm">Manage and approve all institutes on the Lamba marketplace</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Institutes", value: institutes.length, color: "text-foreground" },
            { label: "Pending Approval", value: pendingCount, color: "text-accent" },
            { label: "Live on Lamba", value: approvedCount, color: "text-success" },
          ].map((s) => (
            <Card key={s.label} className="p-4 shadow-card border-border/50 text-center">
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by institute name, code, owner..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? "gradient-hero text-white border-0" : ""}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1.5 text-xs opacity-70">
                  ({institutes.filter((i) => f === "all" || i.status === f).length})
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Institute list */}
        <div className="space-y-3">
          {loading ? (
            <Card className="p-10 text-center shadow-card border-border/50">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading institutes...</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center shadow-card border-border/50">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold">No institutes found</p>
              <p className="text-muted-foreground text-sm">No {filter === "all" ? "" : filter} institute registrations yet.</p>
            </Card>
          ) : (
            filtered.map((inst, i) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-5 shadow-card border-border/50 hover:border-primary/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0 shadow">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold">{inst.institute_name}</span>
                        <Badge className="text-xs bg-muted text-muted-foreground border-0 font-mono">{inst.institute_code}</Badge>
                        {inst.status === "pending" && (
                          <Badge className="text-xs bg-accent-light text-accent border-0 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Pending
                          </Badge>
                        )}
                        {inst.status === "approved" && (
                          <Badge className="text-xs bg-success-light text-success border-0 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Live
                          </Badge>
                        )}
                        {inst.status === "rejected" && (
                          <Badge className="text-xs bg-danger-light text-danger border-0 flex items-center gap-1">
                            <XCircle className="w-2.5 h-2.5" /> Rejected
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Owner: <strong className="text-foreground">{inst.owner_name}</strong></span>
                        <span>Govt Reg: <strong className="text-foreground">{inst.govt_registration_no}</strong></span>
                        <span>Email: <strong className="text-foreground">{inst.email}</strong></span>
                        <span>Phone: <strong className="text-foreground">{inst.phone}</strong></span>
                        <span className="text-muted-foreground/60">Submitted {timeAgo(inst.created_at)}</span>
                      </div>
                    </div>

                    {inst.status === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          disabled={actionLoading === inst.id}
                          className="bg-success-light text-success hover:bg-success hover:text-white border border-success/20 h-8 text-xs gap-1 transition-colors"
                          onClick={() => handleAction(inst, "approved")}
                        >
                          {actionLoading === inst.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === inst.id}
                          className="text-danger border-danger/30 hover:bg-danger-light h-8 text-xs gap-1"
                          onClick={() => handleAction(inst, "rejected")}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
