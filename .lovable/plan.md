
## Goal
Add a `role_based_code` column (nullable text) to `profiles`. For students it stores their self-entered Student ID, for teachers it stores their Teacher ID. All other roles (admin, owner, super_admin) remain NULL.

---

## Your Question: Is a single teacher in multi-institutes a good action?
**Yes — it is already implemented and correct.** Since the previous session, teachers can register at multiple institutes with the same email, each getting their own profile row per institute. The `batchhub_active_institute` localStorage key ensures they see the right institute's data per login session. `role_based_code` will cleanly store the teacher's self-entered ID per institute profile row.

---

## Why `role_based_code` and not a more specific name like `student_code`

Because teachers also have a self-entered ID (`teacherId` in `extra_data`). One column covers both cases — NULL for roles that don't use it (admin, parent, owner, super_admin).

---

## What Gets Changed

### 1. DB Migration
Add `role_based_code TEXT` (nullable, no constraints) to `profiles`.

### 2. `AdminApprovals.tsx` — write on approval
In `executeApproval`, after profile update is confirmed as `approved`, also write `role_based_code` from `extra_data`:
- For `student`: from `extra_data.studentId`
- For `teacher`: from `extra_data.teacherId`
- For other roles: leave NULL (no change)

```
if (req.role === "student" && extra.studentId) updates.role_based_code = extra.studentId
if (req.role === "teacher" && extra.teacherId) updates.role_based_code = extra.teacherId
```

### 3. `StudentSettings.tsx` — read directly from profile
Remove the extra `pending_requests` query that fetches `extra_data.studentId`. Read `profile.role_based_code` instead. Saves one DB round-trip per settings page load.

### 4. `TeacherSettings.tsx` — same improvement  
Remove the `pending_requests` query for `extra_data.teacherId`. Read `profile.role_based_code` instead.

### 5. `AdminStudents.tsx` — show + search by it
- Show the `role_based_code` as a small badge/chip on each student card (below the name)
- Add it to the client-side `filtered` search so admin can type a roll number and find the student
- Show it in the student detail dialog

### 6. `AdminTeam.tsx` — show teacher ID on teacher cards
- Show `role_based_code` under teacher name on the teacher card if it exists
- Add it to the search filter

---

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/` | Add `role_based_code TEXT` nullable column |
| `AdminApprovals.tsx` | Write `role_based_code` from `extra_data` on approval |
| `StudentSettings.tsx` | Read from `profile.role_based_code`, drop `pending_requests` query |
| `TeacherSettings.tsx` | Read from `profile.role_based_code`, drop `pending_requests` query |
| `AdminStudents.tsx` | Display + search by `role_based_code` |
| `AdminTeam.tsx` | Display + search by `role_based_code` on teacher cards |

No RLS changes. No breaking changes. `id` and `user_id` untouched.
