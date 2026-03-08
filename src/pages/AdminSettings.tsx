import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building2, Bell, Shield, Palette, Users } from "lucide-react";

export default function AdminSettings() {
  return (
    <DashboardLayout title="Settings">
      <div className="space-y-5 max-w-2xl">
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
              <Input defaultValue="Apex Classes" />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input defaultValue="Kota, Rajasthan" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input defaultValue="admin@apexclasses.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input defaultValue="+91 98765 43210" />
            </div>
          </div>
          <Button className="mt-4 gradient-hero text-white border-0 shadow-primary hover:opacity-90">Save Changes</Button>
        </Card>

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

        <Card className="p-5 shadow-card border-border/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-success-light flex items-center justify-center">
              <Users className="w-4 h-4 text-success" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Team Management</h3>
              <p className="text-xs text-muted-foreground">Manage admin access</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: "Rajesh Kumar", role: "Admin", email: "rajesh@apex.com" },
              { name: "Sonia Gupta", role: "Co-Admin", email: "sonia@apex.com" },
            ].map((m) => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-white text-xs font-bold">
                    {m.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{m.role}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 text-primary border-primary/30 hover:bg-primary-light">+ Invite Team Member</Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
