
## Root Cause — Confirmed

### Problem 1: Teacher cannot update a batch that has no teacher yet (CRITICAL BUG)

The `batches` table has this RLS policy for UPDATE:
```
"Teachers can update own batches" → WHERE teacher_id = auth.uid()
```

When a teacher accepts a batch request, the batch still has `teacher_id = NULL`. The UPDATE `WHERE id = req.batch_id` runs, but RLS filters it out because `NULL = auth.uid()` is false. **Zero rows are updated. No error is thrown.** The code silently proceeds to mark the request `accepted`, but the batch remains with `teacher_id = NULL` and `teacher_name = NULL`.

**Proof from DB:**
- `batch_teacher_requests`: `status = accepted`, `teacher_id = 3f786f1b` ✓
- `batches`: `teacher_id = NULL`, `teacher_name = NULL` ✗ — the update never went through

### Problem 2: `handleRequest` doesn't check if UPDATE actually worked

The code in `TeacherDashboard.tsx` checks `if (batchErr)` — but when RLS silently blocks the update, PostgREST returns 200 with 0 rows changed and **no error**. So `batchErr` is null and the code thinks it succeeded.

### Problem 3: Admin panel shows "No teacher assigned" even after teacher accepts

Because `teacher_id` and `teacher_name` on `batches` are never written, the admin panel reads the batch and correctly shows "No teacher assigned".

### Problem 4: Teacher dashboard shows no batches after accepting

`TeacherDashboard.tsx` fetches batches with `.eq("teacher_id", user.id)` — since `teacher_id` is NULL, nothing is returned.

---

## The Fix

### Fix 1: Add a new RLS policy — "Teacher accepting assignment can update batch"

A teacher should be allowed to update a batch's `teacher_id`/`teacher_name` when there is an **accepted** `batch_teacher_requests` row linking them to that batch. Add a new PERMISSIVE policy:

```sql
CREATE POLICY "Teacher can claim batch via accepted request"
ON public.batches
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.batch_teacher_requests btr
    WHERE btr.batch_id = batches.id
      AND btr.teacher_id = auth.uid()
      AND btr.status = 'pending'
  )
);
```

This allows a teacher to update the batch **only when** there is a pending request from admin appointing them to it. This is secure — the admin created the request, so the teacher has permission to claim it.

### Fix 2: Backfill the existing broken batch

The current batch `38ff1a5e` (Class IX Physics, LAM01) has an accepted request but `teacher_id = NULL`. We need to write the teacher data directly via a data fix (using the service role, outside RLS).

Run via migration/data fix:
```sql
UPDATE public.batches
SET teacher_id = '3f786f1b-6b95-419b-91b3-c76861a94191',
    teacher_name = 'Lavii Singh'
WHERE id = '38ff1a5e-0e59-4fe3-8db3-593268afd1f1';
```

### Fix 3: Improve `handleRequest` to verify the UPDATE actually worked

Add a check using `.select()` after the update to confirm rows were modified. If not, show a clear error:
```ts
const { data: updated, error: batchErr } = await supabase
  .from("batches")
  .update({ teacher_id: user.id, teacher_name: teacherName })
  .eq("id", req.batch_id)
  .select("id");

if (batchErr || !updated || updated.length === 0) {
  toast({ title: "Error", description: "Could not update batch. The admin may need to re-send the request.", variant: "destructive" });
  ...
}
```

---

## Files to change

| Change | Where |
|---|---|
| Add new RLS policy "Teacher can claim batch via accepted request" | DB migration |
| Backfill existing broken batch (Class IX Physics) | DB data fix |
| Fix `handleRequest` to verify UPDATE worked + show error if it didn't | `src/pages/TeacherDashboard.tsx` |
| Also fix: mark request as accepted **only after** batch update succeeds | `src/pages/TeacherDashboard.tsx` |
