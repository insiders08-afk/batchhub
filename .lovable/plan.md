
## Analysis: What's Already Done vs. What's Needed

### The Good News: Approval-time storage is ALREADY correct

Looking at `AdminApprovals.tsx` lines 255-259, the `executeApproval` function already stores `institute_code` in `user_roles` at approval time:

```
supabase.from("user_roles").insert({
  user_id: req.user_id,
  role: req.role,
  institute_code: req.institute_code,  ← already there
});
```

The `repairMissingRoles` function also backfills any old records that might be missing it. So the suggested fix from the prior suggestion is **already implemented**.

### The Real Gap: `get_my_institute_code()` uses `LIMIT 1`

The DB function is:
```sql
SELECT institute_code FROM public.user_roles
WHERE user_id = auth.uid() AND role != 'super_admin'
LIMIT 1  ← problem for multi-institute users
```

For a teacher who is part of **two institutes** (INST-A and INST-B), `user_roles` has two rows. `LIMIT 1` returns an indeterminate one. This means:
- Teacher logs in via `/auth/teacher` choosing INST-A with institute code INST-A
- App navigates to `/teacher` correctly
- BUT all RLS policies call `get_my_institute_code()` which may return INST-B
- Teacher sees INST-B's batches, announcements, students — wrong institute data

### What Needs to Be Fixed

After login, the active institute code must be stored in `localStorage` so it persists across page loads, and every teacher/student query must explicitly filter by it instead of relying on `get_my_institute_code()` alone.

**The plan:**

**1. Store active institute after login**
- In `TeacherAuth.tsx` `handleLogin`: after successful profile lookup, write `localStorage.setItem("batchhub_active_institute", instituteCode)` 
- Same in `StudentAuth.tsx` `handleLogin`
- On logout (in `DashboardLayout.tsx`): clear this key from localStorage

**2. Update TeacherDashboard profile query**
- `TeacherDashboard.tsx` line 60-64 uses `.single()` on profiles — for a multi-institute teacher this returns an ambiguous row. Change it to read the active institute from `localStorage` and add `.eq("institute_code", activeCode)` to the profiles query.

**3. Update StudentDashboard similarly**
- Same pattern: read `batchhub_active_institute` from localStorage and scope the profile query to that institute.

**4. No DB changes required**
- `user_roles` already stores `institute_code` correctly
- RLS policies continue to work correctly for single-institute users (the common case)
- The localStorage value acts as the "session institute selector" for multi-institute users

### Impact Summary

| What | Before fix | After fix |
|---|---|---|
| Single-institute teacher login | Works ✓ | Works ✓ (no change) |
| Multi-institute teacher login | May see wrong institute data | Sees correct institute data ✓ |
| Admin approval storing institute_code | Already done ✓ | No change needed |
| RLS security | Unchanged | Unchanged |
| DB schema | No change | No change |
| Files changed | — | `TeacherAuth.tsx`, `StudentAuth.tsx`, `TeacherDashboard.tsx`, `StudentDashboard.tsx`, `DashboardLayout.tsx` |

This is a pure frontend fix — no migrations, no DB changes, no RLS rewrites.
