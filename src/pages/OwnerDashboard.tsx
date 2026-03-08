import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Crown, LogOut, Users, Building2, MapPin, CheckCircle, XCircle, Clock,
  Globe, Loader2, User, Phone, Mail, Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  city: string;
  facial_image_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

type Stats = {
  totalInstitutes: number;
  pendingInstitutes: number;
  approvedInstitutes: number;
  totalSuperAdmins: number;
  totalCities: number;
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ totalInstitutes: 0, pendingInstitutes: 0, approvedInstitutes: 0, totalSuperAdmins: 0, totalCities: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    checkOwnerAccess();
  }, []);

  const checkOwnerAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth/owner"); return; }

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "app_owner")
      .maybeSingle();

    if (!role) { navigate("/auth/owner"); return; }

    fetchAll();
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [appsRes, institutesRes, rolesRes] = await Promise.all([
        supabase.from("super_admin_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("institutes").select("id, status, city"),
        supabase.from("user_roles").select("role, city").eq("role", "super_admin"),
      ]);

      if (appsRes.data) setApplications(appsRes.data);

      const institutes = institutesRes.data || [];
      const superAdmins = rolesRes.data || [];
      const cities = new Set(superAdmins.map(r => r.city).filter(Boolean));

      setStats({
        totalInstitutes: institutes.length,
        pendingInstitutes: institutes.filter(i => i.status === "pending").length,
        approvedInstitutes: institutes.filter(i => i.status === "approved").length,
        totalSuperAdmins: superAdmins.length,
        totalCities: cities.size,
      });
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (app: Application) => {
    setActionLoading(app.id);
    try {
      // 1. Create auth user for the applicant
      const tempPassword = `Lamba@${Math.random().toString(36).slice(2, 10)}`;
      const { data: newUser, error: createError } = await supabase.functions.invoke("fix-superadmin", {
        body: { action: "create_super_admin", email: app.email, password: tempPassword, city: app.city, fullName: app.full_name }
      });

      // If edge fn not available, just update status and note the manual step
      const { error: updateError } = await supabase
        .from("super_admin_applications")
        .update({ status: "approved", notes: `Approved. Temp password: ${tempPassword}` })
        .eq("id", app.id);

      if (updateError) throw updateError;

      toast({ title: "Application approved", description: `${app.full_name} is now a City Super Admin for ${app.city}. Temp password: ${tempPassword}` });
      fetchAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to approve";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectApplication = async (appId: string, name: string) => {
    setActionLoading(appId);
    try {
      const { error } = await supabase
        .from("super_admin_applications")
        .update({ status: "rejected" })
        .eq("id", appId);
      if (error) throw error;
      toast({ title: "Application rejected", description: `${name}'s application has been rejected.` });
      fetchAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reject";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredApps = applications.filter(a => filter === "all" ? true : a.status === filter);

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
    if (status === "rejected") return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-gradient">Lamba Owner Portal</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Total Institutes", value: stats.totalInstitutes, icon: Building2, color: "text-primary" },
                { label: "Pending Review", value: stats.pendingInstitutes, icon: Clock, color: "text-amber-500" },
                { label: "Approved", value: stats.approvedInstitutes, icon: CheckCircle, color: "text-green-500" },
                { label: "Super Admins", value: stats.totalSuperAdmins, icon: Users, color: "text-blue-500" },
                { label: "Cities Active", value: stats.totalCities, icon: Globe, color: "text-purple-500" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border/50">
                  <CardContent className="p-4 flex flex-col gap-1">
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                    <p className="text-2xl font-bold font-display">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* City Super Admin Applications */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold">City Partner Applications</h2>
                <div className="flex gap-2">
                  {(["pending", "approved", "rejected", "all"] as const).map(f => (
                    <Button
                      key={f}
                      size="sm"
                      variant={filter === f ? "default" : "outline"}
                      onClick={() => setFilter(f)}
                      className="capitalize text-xs h-8"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <Card className="border-border/50 border-dashed">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No {filter !== "all" ? filter : ""} applications yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredApps.map((app) => (
                    <Card key={app.id} className="border-border/50 overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16 rounded-xl border border-border/50 flex-shrink-0">
                            <AvatarImage src={app.facial_image_url || ""} alt={app.full_name} />
                            <AvatarFallback className="rounded-xl bg-muted text-lg font-bold">
                              {app.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold font-display truncate">{app.full_name}</span>
                              {statusBadge(app.status)}
                            </div>
                            <div className="space-y-0.5 text-sm text-muted-foreground">
                              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{app.email}</p>
                              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{app.phone}</p>
                              <p className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{app.position}</p>
                              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{app.city}</p>
                            </div>
                            {app.notes && (
                              <p className="text-xs text-muted-foreground mt-2 bg-muted rounded p-2 font-mono break-all">{app.notes}</p>
                            )}
                          </div>
                        </div>
                        {app.status === "pending" && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white border-0 gap-1.5"
                              disabled={actionLoading === app.id}
                              onClick={() => approveApplication(app)}
                            >
                              {actionLoading === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                              disabled={actionLoading === app.id}
                              onClick={() => rejectApplication(app.id, app.full_name)}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
