
-- Fix 1: Add UPDATE policy for admins on user_roles (missing policy causing 403 on re-approvals)
CREATE POLICY "Admin can update roles for their institute"
ON public.user_roles FOR UPDATE
TO authenticated
USING ((institute_code = get_my_institute_code()) AND has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Enable realtime on pending_requests for live UI updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_requests;
