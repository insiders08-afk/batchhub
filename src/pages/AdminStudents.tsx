import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, GraduationCap, Phone, Mail, BookOpen } from "lucide-react";

const students = [
  { id: 1, name: "Arjun Sharma", roll: "JA-001", batch: "JEE Advanced A", phone: "+91 98765 43210", email: "arjun@example.com", attendance: 92, feeStatus: "paid" },
  { id: 2, name: "Priya Verma", roll: "JA-002", batch: "JEE Advanced A", phone: "+91 87654 32109", email: "priya@example.com", attendance: 58, feeStatus: "partial" },
  { id: 3, name: "Rohan Mehta", roll: "NA-001", batch: "NEET A", phone: "+91 76543 21098", email: "rohan@example.com", attendance: 88, feeStatus: "overdue" },
  { id: 4, name: "Sneha Patel", roll: "NA-002", batch: "NEET A", phone: "+91 65432 10987", email: "sneha@example.com", attendance: 95, feeStatus: "paid" },
  { id: 5, name: "Aditya Kumar", roll: "JB-001", batch: "JEE Mains B", phone: "+91 54321 09876", email: "aditya@example.com", attendance: 76, feeStatus: "partial" },
  { id: 6, name: "Kavya Singh", roll: "F9-001", batch: "Foundation 9th", phone: "+91 43210 98765", email: "kavya@example.com", attendance: 99, feeStatus: "paid" },
  { id: 7, name: "Harsh Gupta", roll: "JA-003", batch: "JEE Advanced A", phone: "+91 32109 87654", email: "harsh@example.com", attendance: 81, feeStatus: "overdue" },
  { id: 8, name: "Ananya Rao", roll: "NB-001", batch: "NEET B", phone: "+91 21098 76543", email: "ananya@example.com", attendance: 90, feeStatus: "paid" },
];

const feeColors: Record<string, string> = {
  paid: "bg-success-light text-success border-success/20",
  partial: "bg-accent-light text-accent border-accent/20",
  overdue: "bg-danger-light text-danger border-danger/20",
};

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.batch.toLowerCase().includes(search.toLowerCase()) ||
    s.roll.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Students">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Add New Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input placeholder="Student name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Roll Number</Label>
                    <Input placeholder="e.g. JA-012" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Assign Batch</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jee-a">JEE Advanced A</SelectItem>
                      <SelectItem value="jee-b">JEE Mains B</SelectItem>
                      <SelectItem value="neet-a">NEET A</SelectItem>
                      <SelectItem value="neet-b">NEET B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input placeholder="student@example.com" />
                  </div>
                </div>
                <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90" onClick={() => setDialogOpen(false)}>
                  Add Student
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 shadow-card border-border/50 hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {s.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.roll}</p>
                  </div>
                  <Badge className={`text-xs flex-shrink-0 ${feeColors[s.feeStatus]}`}>
                    {s.feeStatus.charAt(0).toUpperCase() + s.feeStatus.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="w-3 h-3" />
                    <span>{s.batch}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{s.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Attendance</span>
                      <span className={`text-xs font-semibold ${s.attendance >= 75 ? 'text-success' : 'text-danger'}`}>{s.attendance}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.attendance >= 75 ? 'bg-success' : 'bg-danger'}`}
                        style={{ width: `${s.attendance}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
