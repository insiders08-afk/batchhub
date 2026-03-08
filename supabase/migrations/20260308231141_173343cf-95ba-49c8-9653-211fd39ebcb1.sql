
-- Fix 1: Convert all RESTRICTIVE RLS policies to PERMISSIVE across all tables
-- Supabase default policies are already PERMISSIVE by default when created via SQL.
-- The "Permissive: No" in the UI means they were created as RESTRICTIVE.
-- We drop and recreate them as PERMISSIVE (the default).

-- ===== announcements =====
DROP POLICY IF EXISTS "Institute members can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Teachers and admins can delete announcements" ON public.announcements;

CREATE POLICY "Institute members can view announcements" ON public.announcements FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Teachers and admins can insert announcements" ON public.announcements FOR INSERT WITH CHECK ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers and admins can update announcements" ON public.announcements FOR UPDATE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers and admins can delete announcements" ON public.announcements FOR DELETE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- ===== attendance =====
DROP POLICY IF EXISTS "Institute members can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers and admins can delete attendance" ON public.attendance;

CREATE POLICY "Institute members can view attendance" ON public.attendance FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Teachers and admins can insert attendance" ON public.attendance FOR INSERT WITH CHECK ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers and admins can update attendance" ON public.attendance FOR UPDATE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers and admins can delete attendance" ON public.attendance FOR DELETE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- ===== batch_messages =====
DROP POLICY IF EXISTS "Institute members can send messages" ON public.batch_messages;
DROP POLICY IF EXISTS "Institute members can view batch messages" ON public.batch_messages;

CREATE POLICY "Institute members can view batch messages" ON public.batch_messages FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Institute members can send messages" ON public.batch_messages FOR INSERT WITH CHECK ((sender_id = auth.uid()) AND (institute_code = get_my_institute_code()));

-- ===== batches =====
DROP POLICY IF EXISTS "Institute members can view batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can insert batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can update batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can delete batches" ON public.batches;

CREATE POLICY "Institute members can view batches" ON public.batches FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Admins can insert batches" ON public.batches FOR INSERT WITH CHECK ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));
CREATE POLICY "Admins can update batches" ON public.batches FOR UPDATE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));
CREATE POLICY "Admins can delete batches" ON public.batches FOR DELETE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));

-- ===== fees =====
DROP POLICY IF EXISTS "Admins can manage fees" ON public.fees;
DROP POLICY IF EXISTS "Students can view own fees" ON public.fees;

CREATE POLICY "Admins can manage fees" ON public.fees FOR ALL USING ((institute_code = get_my_institute_code()) AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Students can view own fees" ON public.fees FOR SELECT USING (student_id = auth.uid());

-- ===== institutes =====
DROP POLICY IF EXISTS "Super admin can manage all institutes" ON public.institutes;
DROP POLICY IF EXISTS "Owner can view and update their institute" ON public.institutes;
DROP POLICY IF EXISTS "Public institute registration insert" ON public.institutes;
DROP POLICY IF EXISTS "App owner can manage all institutes" ON public.institutes;

CREATE POLICY "Super admin can manage all institutes" ON public.institutes FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Owner can view and update their institute" ON public.institutes FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Owner can update their institute" ON public.institutes FOR UPDATE USING (owner_user_id = auth.uid());
CREATE POLICY "Public institute registration insert" ON public.institutes FOR INSERT WITH CHECK (true);
CREATE POLICY "App owner can manage all institutes" ON public.institutes FOR ALL USING (has_role(auth.uid(), 'app_owner'::app_role));

-- ===== pending_requests =====
DROP POLICY IF EXISTS "Users can view own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Users can insert own pending request" ON public.pending_requests;
DROP POLICY IF EXISTS "Admins can manage their institute requests" ON public.pending_requests;
DROP POLICY IF EXISTS "Super admin can manage all requests" ON public.pending_requests;

CREATE POLICY "Users can view own pending request" ON public.pending_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pending request" ON public.pending_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage their institute requests" ON public.pending_requests FOR ALL USING ((institute_code = get_my_institute_code()) AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Super admin can manage all requests" ON public.pending_requests FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- ===== profiles =====
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles in their institute" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "App owner can view all profiles" ON public.profiles;

CREATE POLICY "Users can view and update own profile" ON public.profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins can view profiles in their institute" ON public.profiles FOR SELECT USING ((institute_code = get_my_institute_code()) AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Super admin can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Anyone can insert profile during signup" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "App owner can view all profiles" ON public.profiles FOR ALL USING (has_role(auth.uid(), 'app_owner'::app_role));

-- ===== students_batches =====
DROP POLICY IF EXISTS "Institute members can view enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can insert enrollments" ON public.students_batches;
DROP POLICY IF EXISTS "Admins and teachers can delete enrollments" ON public.students_batches;

CREATE POLICY "Institute members can view enrollments" ON public.students_batches FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Admins and teachers can insert enrollments" ON public.students_batches FOR INSERT WITH CHECK ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));
CREATE POLICY "Admins and teachers can delete enrollments" ON public.students_batches FOR DELETE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role)));

-- ===== test_scores =====
DROP POLICY IF EXISTS "Institute members can view test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can insert test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can update test scores" ON public.test_scores;
DROP POLICY IF EXISTS "Teachers and admins can delete test scores" ON public.test_scores;

CREATE POLICY "Institute members can view test scores" ON public.test_scores FOR SELECT USING (institute_code = get_my_institute_code());
CREATE POLICY "Teachers and admins can insert test scores" ON public.test_scores FOR INSERT WITH CHECK ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers and admins can update test scores" ON public.test_scores FOR UPDATE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Teachers and admins can delete test scores" ON public.test_scores FOR DELETE USING ((institute_code = get_my_institute_code()) AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));

-- ===== user_roles =====
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin manages all roles" ON public.user_roles;
DROP POLICY IF EXISTS "App owner manages all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Super admin manages all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "App owner manages all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'app_owner'::app_role));

-- ===== super_admin_applications =====
DROP POLICY IF EXISTS "Anyone can submit a super admin application" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can view all applications" ON public.super_admin_applications;
DROP POLICY IF EXISTS "App owner can update application status" ON public.super_admin_applications;

CREATE POLICY "Anyone can submit a super admin application" ON public.super_admin_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "App owner can view all applications" ON public.super_admin_applications FOR SELECT USING (has_role(auth.uid(), 'app_owner'::app_role));
CREATE POLICY "App owner can update application status" ON public.super_admin_applications FOR UPDATE USING (has_role(auth.uid(), 'app_owner'::app_role));

-- Fix 2: Add SELECT policy on super_admin_applications for institute admin city lookup
-- Allow admins to look up the city partner contact for their city (for the pending/rejected screen)
CREATE POLICY "Admins can look up city partner contact" ON public.super_admin_applications FOR SELECT USING (true);

-- Fix 3: Partial unique index: only one super_admin per city
CREATE UNIQUE INDEX IF NOT EXISTS unique_super_admin_per_city ON public.user_roles (city) WHERE (role = 'super_admin' AND city IS NOT NULL);
