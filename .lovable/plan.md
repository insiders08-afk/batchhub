
## The Two Real Bugs + Their Fixes

### Bug 1: 403 on `user_roles` INSERT — The actual root cause

The network log is clear:
```
POST /rest/v1/user_roles → 403
"new row violates row-level security policy for table user_roles"
```

The admin's INSERT policy on `user_roles` is:
```sql
(institute_code = get_my_institute_code()) AND has_role(auth.uid(), 'admin')
```

This works for first-time approvals. But the code uses **upsert with `onConflict: "user_id,role"`** — when the same teacher re-applies and gets approved again, the upsert tries to **UPDATE** the existing row. There is **no UPDATE policy for admins** on `user_roles` (only `app_owner` and `super_admin` have ALL). So re-approvals always fail with 403.

**Fix**: Add a migration with an UPDATE policy for admins on `user_roles`:
```sql
CREATE POLICY "Admin can update roles for their institute"
ON public.user_roles FOR UPDATE
TO authenticated
USING ((institute_code = get_my_institute_code()) AND has_role(auth.uid(), 'admin'::app_role));
```

Also fix the upsert in `AdminApprovals.tsx` to do a plain INSERT with `ignoreDuplicates` instead of upsert. If it's a re-approval, we want to keep the row, not update it. Better: do INSERT and if it fails (duplicate), just silently ignore — the role row already exists.

### Bug 2: Approvals page doesn't update in real-time + shows error toast

The sequence is:
1. Admin clicks Approve
2. `pending_requests` PATCH → 204 ✓
3. `profiles` PATCH → 204 ✓  
4. `user_roles` POST → **403** ← throws, goes to catch
5. Catch block shows "Action failed" toast
6. `setRequests` state update (line 102) is **never reached** because the error was thrown before it

So the UI shows an error even though 2/3 steps worked. Fix:
- Catch the `user_roles` error separately (don't throw)
- Always run the local state update even if `user_roles` upsert fails
- Add a Supabase Realtime subscription to `pending_requests` so the list auto-updates when anyone approves

### Bug 3: Teacher/Student waiting screen doesn't auto-redirect on approval

The `PendingApprovalScreen` component in `TeacherAuth.tsx` and `StudentAuth.tsx` renders a static screen and signs out the user immediately after registration. There is no mechanism to detect when the admin approves.

**Fix**: 
- Instead of signing out immediately after registration, keep the user signed in
- In `PendingApprovalScreen`, add a `useEffect` with `setInterval` polling every 5 seconds that calls `supabase.from("profiles").select("status").eq("user_id", currentUserId).maybeSingle()`
- If status becomes `approved`, show a success animation and redirect to `/teacher` or `/student`
- If status becomes `rejected`, update the screen to show the rejected state
- Sign out only when the user explicitly clicks "Back to Home" or if they're on the rejected screen

---

## Files to change

| File | Change |
|---|---|
| Migration | Add UPDATE policy for admin on `user_roles` |
| `src/pages/AdminApprovals.tsx` | Fix upsert → INSERT with conflict ignore; separate `user_roles` error from main flow; add Realtime subscription for auto-refresh |
| `src/pages/auth/TeacherAuth.tsx` | Keep user signed in on pending screen; add polling for approval status → auto-redirect |
| `src/pages/auth/StudentAuth.tsx` | Same polling fix as TeacherAuth |

### How the polling works (simple):

```
Registration → user signed in → pending screen
  → every 5s: check profiles.status
  → if "approved" → show "Approved! Redirecting..." → navigate("/teacher")
  → if "rejected" → update screen to rejected state
```

No Supabase Realtime needed for this — simple polling is enough and more reliable.

### Bonus: Add Realtime to AdminApprovals for the count badge

The admin's pending count and list don't update when a new request comes in. Add a Realtime subscription on `pending_requests` in `AdminApprovals.tsx` that calls `fetchRequests()` whenever there's an INSERT or UPDATE event.
