-- Add policy allowing a teacher to claim a batch when admin has sent them a pending request
CREATE POLICY "Teacher can claim batch via pending request"
ON public.batches
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.batch_teacher_requests btr
    WHERE btr.batch_id = batches.id
      AND btr.teacher_id = auth.uid()
      AND btr.status = 'pending'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.batch_teacher_requests btr
    WHERE btr.batch_id = batches.id
      AND btr.teacher_id = auth.uid()
      AND btr.status = 'pending'
  )
);