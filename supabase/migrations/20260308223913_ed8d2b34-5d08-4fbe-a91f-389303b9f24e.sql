
-- ================================================================
-- FIX 1: Convert ALL restrictive RLS policies to PERMISSIVE
-- In Supabase, when all policies are RESTRICTIVE, access is DENIED.
-- We need at least one PERMISSIVE policy per operation.
-- ================================================================

-- ---- announcements ----
DROP POLICY IF EXISTS "Institute members can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can manage announcements" ON public.announcements;

CREATE POLICY "Institute members can view announcements"
  ON public.announcements FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Teachers and admins can update announcements"
  ON public.announcements FOR UPDATE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Teachers and admins can delete announcements"
  ON public.announcements FOR DELETE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

-- ---- attendance ----
DROP POLICY IF EXISTS "Institute members can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can manage attendance" ON public.attendance;

CREATE POLICY "Institute members can view attendance"
  ON public.attendance FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Teachers and admins can update attendance"
  ON public.attendance FOR UPDATE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Teachers and admins can delete attendance"
  ON public.attendance FOR DELETE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

-- ---- batch_messages ----
DROP POLICY IF EXISTS "Institute members can view batch messages" ON public.batch_messages;
DROP POLICY IF EXISTS "Institute members can send messages" ON public.batch_messages;

CREATE POLICY "Institute members can view batch messages"
  ON public.batch_messages FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Institute members can send messages"
  ON public.batch_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND institute_code = get_my_institute_code()
  );

-- ---- batches ----
DROP POLICY IF EXISTS "Admins can manage batches" ON public.batches;
DROP POLICY IF EXISTS "Institute members can view batches" ON public.batches;

CREATE POLICY "Institute members can view batches"
  ON public.batches FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins can insert batches"
  ON public.batches FOR INSERT
  WITH CHECK (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  );

CREATE POLICY "Admins can update batches"
  ON public.batches FOR UPDATE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  );

CREATE POLICY "Admins can delete batches"
  ON public.batches FOR DELETE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  );

-- ---- students_batches ----
DROP POLICY IF EXISTS "Admins and teachers can manage enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Institute members can view enrollments" ON public.students_batches;

CREATE POLICY "Institute members can view enrollments"
  ON public.students_batches FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Admins and teachers can insert enrollments"
  ON public.students_batches FOR INSERT
  WITH CHECK (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  );

CREATE POLICY "Admins and teachers can delete enrollments"
  ON public.students_batches FOR DELETE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  );

-- ---- fees ----
DROP POLICY IF EXISTS "Admins can manage fees in their institute" ON public.fees;
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;

CREATE POLICY "Admins can manage fees"
  ON public.fees FOR ALL
  USING (
    institute_code = get_my_institute_code()
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Students can view own fees"
  ON public.fees FOR SELECT
  USING (student_id = auth.uid());

-- ---- test_scores ----
DROP POLICY IF EXISTS "Institute members can view test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can manage test scores" ON public.test_scores;

CREATE POLICY "Institute members can view test scores"
  ON public.test_scores FOR SELECT
  USING (institute_code = get_my_institute_code());

CREATE POLICY "Teachers and admins can insert test scores"
  ON public.test_scores FOR INSERT
  WITH CHECK (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Teachers and admins can update test scores"
  ON public.test_scores FOR UPDATE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Teachers and admins can delete test scores"
  ON public.test_scores FOR DELETE
  USING (
    institute_code = get_my_institute_code()
    AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

-- ================================================================
-- FIX 2: Enforce ONE super_admin per city
-- ================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_super_admin_per_city
  ON public.user_roles (city)
  WHERE role = 'super_admin';
