
-- ============================================================
-- LAMBA MARKETPLACE — FULL DATABASE SCHEMA
-- ============================================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'teacher', 'student', 'parent');
CREATE TYPE public.institute_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected', 'active');

-- 2. TIMESTAMP UPDATE FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. INSTITUTES TABLE (one row per coaching institute)
CREATE TABLE public.institutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_name TEXT NOT NULL,
  institute_name TEXT NOT NULL,
  institute_code TEXT NOT NULL UNIQUE,
  govt_registration_no TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  status public.institute_status NOT NULL DEFAULT 'pending',
  owner_user_id UUID, -- filled after auth signup
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_institutes_updated_at
  BEFORE UPDATE ON public.institutes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. USER ROLES TABLE (separate from profiles — prevents privilege escalation)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  institute_code TEXT,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get current user's institute_code
CREATE OR REPLACE FUNCTION public.get_my_institute_code()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT institute_code FROM public.user_roles
  WHERE user_id = auth.uid() AND role != 'super_admin'
  LIMIT 1
$$;

-- 5. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role public.app_role NOT NULL,
  institute_code TEXT,
  status public.user_status NOT NULL DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. PENDING REQUESTS TABLE (teacher/student/parent sign-up approvals)
CREATE TABLE public.pending_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.app_role NOT NULL,
  institute_code TEXT NOT NULL,
  extra_data JSONB DEFAULT '{}'::jsonb,
  status public.user_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  review_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pending_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_pending_requests_updated_at
  BEFORE UPDATE ON public.pending_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. BATCHES TABLE
CREATE TABLE public.batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  institute_code TEXT NOT NULL,
  teacher_id UUID,
  teacher_name TEXT,
  schedule TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. STUDENTS_BATCHES JOIN TABLE
CREATE TABLE public.students_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  institute_code TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (student_id, batch_id)
);

ALTER TABLE public.students_batches ENABLE ROW LEVEL SECURITY;

-- 9. ATTENDANCE TABLE
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  institute_code TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  present BOOLEAN NOT NULL DEFAULT false,
  marked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (batch_id, student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 10. TEST SCORES TABLE
CREATE TABLE public.test_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  institute_code TEXT NOT NULL,
  test_name TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  max_marks NUMERIC NOT NULL DEFAULT 100,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;

-- 11. FEES TABLE
CREATE TABLE public.fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  institute_code TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  due_date DATE,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_fees_updated_at
  BEFORE UPDATE ON public.fees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. ANNOUNCEMENTS TABLE
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  institute_code TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_by UUID NOT NULL,
  posted_by_name TEXT,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- INSTITUTES: super_admin sees all; owner sees their own
CREATE POLICY "Super admin can manage all institutes"
  ON public.institutes FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Owner can view and update their institute"
  ON public.institutes FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Anyone can insert institute during registration"
  ON public.institutes FOR INSERT
  WITH CHECK (true);

-- USER_ROLES: users see their own roles; super_admin sees all
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin manages all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- PROFILES: users see their own; admins see same institute
CREATE POLICY "Users can view and update own profile"
  ON public.profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view profiles in their institute"
  ON public.profiles FOR SELECT
  USING (
    institute_code = public.get_my_institute_code()
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can insert profile during signup"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- PENDING_REQUESTS: users see own request; admins see their institute's requests
CREATE POLICY "Users can view own pending request"
  ON public.pending_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pending request"
  ON public.pending_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage their institute requests"
  ON public.pending_requests FOR ALL
  USING (
    institute_code = public.get_my_institute_code()
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Super admin can manage all requests"
  ON public.pending_requests FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- BATCHES: same-institute isolation
CREATE POLICY "Institute members can view batches"
  ON public.batches FOR SELECT
  USING (institute_code = public.get_my_institute_code());

CREATE POLICY "Admins can manage batches"
  ON public.batches FOR ALL
  USING (
    institute_code = public.get_my_institute_code()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
  );

-- STUDENTS_BATCHES
CREATE POLICY "Institute members can view enrollments"
  ON public.students_batches FOR SELECT
  USING (institute_code = public.get_my_institute_code());

CREATE POLICY "Admins and teachers can manage enrollments"
  ON public.students_batches FOR ALL
  USING (
    institute_code = public.get_my_institute_code()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
  );

-- ATTENDANCE
CREATE POLICY "Institute members can view attendance"
  ON public.attendance FOR SELECT
  USING (institute_code = public.get_my_institute_code());

CREATE POLICY "Teachers and admins can manage attendance"
  ON public.attendance FOR ALL
  USING (
    institute_code = public.get_my_institute_code()
    AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  );

-- TEST SCORES
CREATE POLICY "Institute members can view test scores"
  ON public.test_scores FOR SELECT
  USING (institute_code = public.get_my_institute_code());

CREATE POLICY "Teachers and admins can manage test scores"
  ON public.test_scores FOR ALL
  USING (
    institute_code = public.get_my_institute_code()
    AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  );

-- FEES
CREATE POLICY "Students can view own fees"
  ON public.fees FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage fees in their institute"
  ON public.fees FOR ALL
  USING (
    institute_code = public.get_my_institute_code()
    AND public.has_role(auth.uid(), 'admin')
  );

-- ANNOUNCEMENTS
CREATE POLICY "Institute members can view announcements"
  ON public.announcements FOR SELECT
  USING (institute_code = public.get_my_institute_code());

CREATE POLICY "Teachers and admins can manage announcements"
  ON public.announcements FOR ALL
  USING (
    institute_code = public.get_my_institute_code()
    AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  );

-- ============================================================
-- AUTO-CREATE PROFILE TRIGGER ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Profile is created explicitly during registration, not auto-generated
  RETURN NEW;
END;
$$;
