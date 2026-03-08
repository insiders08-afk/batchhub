import { useState } from "react";
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
import { Plus, Search, Users, BookOpen, Clock, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const batchesData = [
  { id: "jee-a", name: "JEE Advanced A", course: "JEE", teacher: "Amit Gupta", schedule: "Mon, Wed, Fri — 8:00 AM", students: 45, status: "active", color: "bg-primary gradient-hero" },
  { id: "jee-b", name: "JEE Mains B", course: "JEE", teacher: "Rahul Verma", schedule: "Tue, Thu, Sat — 10:00 AM", students: 38, status: "active", color: "bg-success" },
  { id: "neet-a", name: "NEET A Batch", course: "NEET", teacher: "Dr. Sunita Rao", schedule: "Daily — 7:00 AM", students: 62, status: "active", color: "bg-accent" },
  { id: "neet-b", name: "NEET B Batch", course: "NEET", teacher: "Dr. Priya Mehta", schedule: "Mon–Sat — 2:00 PM", students: 41, status: "active", color: "bg-violet-500" },
  { id: "found-9", name: "Foundation 9th", course: "Foundation", teacher: "Suresh Kumar", schedule: "Mon, Wed, Fri — 4:00 PM", students: 55, status: "active", color: "bg-teal-500" },
  { id: "found-10", name: "Foundation 10th", course: "Foundation", teacher: "Nita Sharma", schedule: "Tue, Thu — 5:00 PM", students: 48, status: "active", color: "bg-pink-500" },
];

const courses = ["JEE", "NEET", "Foundation", "CUET", "Other"];

export default function AdminBatches() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = batchesData.filter(b =>
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
                  <Input placeholder="e.g. JEE Advanced 2025 – A" />
                </div>
                <div className="space-y-1.5">
                  <Label>Course</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned Teacher</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amit">Amit Gupta</SelectItem>
                      <SelectItem value="sunita">Dr. Sunita Rao</SelectItem>
                      <SelectItem value="rahul">Rahul Verma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Schedule</Label>
                  <Input placeholder="e.g. Mon, Wed, Fri — 8:00 AM" />
                </div>
                <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90" onClick={() => setDialogOpen(false)}>
                  Create Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((batch, i) => (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-all hover:-translate-y-0.5 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {batch.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm leading-tight">{batch.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-0.5">{batch.course}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-7 h-7"><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-danger hover:text-danger"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{batch.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{batch.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{batch.students} students enrolled</span>
                  </div>
                </div>

                <Link to={`/batch/${batch.id}`}>
                  <Button variant="outline" className="w-full h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary-light">
                    Open Batch Workspace <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
