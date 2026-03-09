
-- Add notify_push column to announcements
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS notify_push boolean NOT NULL DEFAULT false;

-- Enable realtime for announcements and batch_teacher_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_teacher_requests;
