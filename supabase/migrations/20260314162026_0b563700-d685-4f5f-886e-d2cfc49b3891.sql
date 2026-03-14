
-- INC-03: homework_submissions table for tracking student submissions
CREATE TABLE public.homework_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  homework_id UUID NOT NULL REFERENCES public.homeworks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  institute_code TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  note TEXT,
  UNIQUE(homework_id, student_id)
);

ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit homework"
  ON public.homework_submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid() AND institute_code = get_my_institute_code());

CREATE POLICY "Students can delete own submission"
  ON public.homework_submissions FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can view own submissions"
  ON public.homework_submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers and admins can view submissions"
  ON public.homework_submissions FOR SELECT
  TO authenticated
  USING (institute_code = get_my_institute_code() AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

CREATE INDEX idx_hw_submissions_homework ON public.homework_submissions(homework_id);
CREATE INDEX idx_hw_submissions_student ON public.homework_submissions(student_id);
