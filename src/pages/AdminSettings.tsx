import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2, Bell, Users, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Institute = Tables<"institutes">;
type Profile = Tables<"profiles">;

export default function AdminSettings() {
  const { toast } = useToast();
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [team, setTeam] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ institute_name: "", city: "", email: "", phone: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get institute
      const { data: inst, error: instErr } = await supabase
        .from("institutes")
        .select("*")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (instErr) throw instErr;
      if (inst) {
        setInstitute(inst);
        setForm({
          institute_name: inst.institute_name,
          city: inst.city || "",
          email: inst.email,
          phone: inst.phone,
        });

        // Fetch team members (all profiles in this institute with admin role)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .eq("institute_code", inst.institute_code)
          .eq("role", "admin");

        setTeam(profiles || []);
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!institute) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("institutes")
        .update({
          institute_name: form.institute_name,
          city: form.city,
          email: form.email,
          phone: form.phone,
        })
        .eq("id", institute.id);

      if (error) throw error;
      toast({ title: "✅ Changes saved!", description: "Institute profile updated successfully." });
      fetchData();
    } catch (err: unknown) {
      toast({ title: "Error saving", description: err instanceof Error ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-5 max-w-2xl">
        {/* Institute Profile */}
        <Card className="p-5 shadow-card border-border/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Institute Profile</h3>
              <p className="text-xs text-muted-foreground">Basic information about your institute</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Institute Name</Label>
              <Input value={form.institute_name} onChange={e => setForm({ ...form, institute_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          {institute && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Institute Code: <strong className="text-foreground font-mono">{institute.institute_code}</strong></p>
              <p className="text-xs text-muted-foreground mt-1">Govt. Reg No: <strong className="text-foreground">{institute.govt_registration_no}</strong></p>
              <p className="text-xs text-muted-foreground mt-1">Status: <strong className={institute.status === "approved" ? "text-success" : institute.status === "pending" ? "text-accent" : "text-danger"}>{institute.status}</strong></p>
            </div>
          )}
          <Button
            className="mt-4 gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
          </Button>
        </Card>

        {/* Notifications */}
        <Card className="p-5 shadow-card border-border/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Bell className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Notifications</h3>
              <p className="text-xs text-muted-foreground">Configure system notifications</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Fee overdue alerts", desc: "Notify admin when fees are overdue by 30+ days", defaultChecked: true },
              { label: "Low attendance alerts", desc: "Alert when student attendance drops below 75%", defaultChecked: true },
              { label: "New student registrations", desc: "Notify when a new student joins the institute", defaultChecked: false },
              { label: "Test score notifications", desc: "Send score updates to students and parents", defaultChecked: true },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch defaultChecked={n.defaultChecked} />
              </div>
            ))}
          </div>
        </Card>

        {/* Team Members */}
        <Card className="p-5 shadow-card border-border/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-success-light flex items-center justify-center">
              <Users className="w-4 h-4 text-success" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Admin Team</h3>
              <p className="text-xs text-muted-foreground">All admins in your institute</p>
            </div>
          </div>
          <div className="space-y-3">
            {team.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other admins found.</p>
            ) : (
              team.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
                      {m.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground capitalize">{m.role}</span>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">To add co-admins, go to <strong>Team</strong> in the sidebar.</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
