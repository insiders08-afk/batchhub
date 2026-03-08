import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Megaphone, Clock, Users } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Unit Test 3 Schedule — JEE Advanced Preparation",
    content: "Unit Test 3 is scheduled for March 15, 2025. Syllabus covers: Mechanics (Ch 1-6), Optics, and Modern Physics. Students are advised to complete the revision sheets distributed in class.",
    batch: "JEE Advanced A",
    teacher: "Amit Gupta",
    time: "2 hours ago",
    type: "test",
  },
  {
    id: 2,
    title: "Holiday Notice: Holi Vacation",
    content: "The institute will remain closed from March 13–16, 2025 on account of Holi festival. Classes will resume on March 17 (Monday) as scheduled.",
    batch: "All Batches",
    teacher: "Admin",
    time: "Yesterday, 4:30 PM",
    type: "general",
  },
  {
    id: 3,
    title: "DPP Sheet 12 Uploaded — Genetics & Evolution",
    content: "Daily Practice Problems Sheet 12 covering Genetics & Evolution (NCERT Ch 5-6) has been uploaded. Students must complete and submit by March 10.",
    batch: "NEET A",
    teacher: "Dr. Sunita Rao",
    time: "Yesterday, 2:00 PM",
    type: "homework",
  },
  {
    id: 4,
    title: "Fee Reminder — March Installment Due",
    content: "This is a reminder that the March fee installment is due by March 10, 2025. Please clear dues to avoid late payment charges. Contact admin for any queries.",
    batch: "All Batches",
    teacher: "Admin",
    time: "Mar 5, 2025",
    type: "fee",
  },
  {
    id: 5,
    title: "Mock Test Results — JEE Mains Pattern",
    content: "Results for the January Full Mock Test have been published. Top scorer: Arjun Sharma (278/300). Detailed analysis shared in batch chat. Weak area report shared individually.",
    batch: "JEE Mains B",
    teacher: "Rahul Verma",
    time: "Mar 4, 2025",
    type: "test",
  },
];

const typeColors: Record<string, string> = {
  test: "bg-primary-light text-primary border-primary/20",
  general: "bg-secondary text-secondary-foreground border-border/40",
  homework: "bg-accent-light text-accent border-accent/20",
  fee: "bg-danger-light text-danger border-danger/20",
};

const typeLabels: Record<string, string> = {
  test: "Test", general: "General", homework: "Homework", fee: "Fee",
};

export default function AdminAnnouncements() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.batch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Announcements">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-white border-0 shadow-primary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" /> New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Post Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input placeholder="Announcement title..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Batch</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        <SelectItem value="jee-a">JEE Advanced A</SelectItem>
                        <SelectItem value="neet-a">NEET A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="homework">Homework</SelectItem>
                        <SelectItem value="fee">Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Content</Label>
                  <Textarea placeholder="Write your announcement..." rows={4} />
                </div>
                <Button className="w-full gradient-hero text-white border-0 shadow-primary hover:opacity-90" onClick={() => setDialogOpen(false)}>
                  Post Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {filtered.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="p-5 shadow-card border-border/50 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="font-display font-semibold text-sm leading-tight">{ann.title}</h3>
                      <Badge className={`text-xs ${typeColors[ann.type]}`}>{typeLabels[ann.type]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{ann.content}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ann.batch}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ann.time}</span>
                      <span className="font-medium text-foreground/70">{ann.teacher}</span>
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
