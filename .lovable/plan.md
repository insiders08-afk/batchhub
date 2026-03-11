
## Plan: Fix Calendar Day-State Logic in AttendanceCalendarView

### What's Wrong

The current calendar has correct structural logic but a few gaps the user described:

1. **Off-days (non-batch weekdays)** — currently show `—` and are dimmed but still render as a `<button>`. They need to be visually **invisible** (white/very faint, no number visible) and completely non-interactive. The column headers (Su, Mo, Tu…) should also be dimmed for off-day columns.

2. **Today's cell** — should be **blue only during the editable attendance window** (class start → class end + 2 hrs). Outside that window, today behaves like any other past day: green/red based on attendance %, or grey if no data.

3. **Future batch-day cells** — should glow orange on hover with the Day Off option. Non-batch future days should be invisible/non-interactive (same as off-days).

4. **Past batch-day cells with data** — green (≥75%) or red (<75%) and tappable. Currently working but the "no data" past batch days should appear as a neutral grey (class happened but attendance wasn't recorded), while off-days should be white/invisible.

5. **Column headers** — for columns that are entirely off-days for this batch (e.g., Su, We, Th, Fr, Sa for a Mon/Tue only batch), the header letters should be faded/dimmed to signal that whole column is inactive.

---

### Exact Changes — Single File: `src/components/attendance/AttendanceCalendarView.tsx`

**A. Column header dimming**
Map each of the 7 header labels (Su→0, Mo→1 … Sa→6) to their JS day index. Check if that day name is in `scheduledDays`. If `hasSchedule` and the day is NOT scheduled, render the header with `text-muted-foreground/20` (very faded). Scheduled day headers stay normal.

**B. Today cell: blue only when attendance window is open**
Import `isAttendanceEditable` from `batchTiming.ts`. Compute it once at render time. For `isTodayDay`:
- If editable window is open → blue (current behavior, always blue regardless of data)
- If window is closed → treat today the same as any past day: green/red if data exists, neutral grey if no data

**C. Off-day cells: truly invisible**
Change off-day cells from a button to a plain `<div>` with `text-transparent` or `text-muted-foreground/10` so the number is nearly invisible. Remove the `—` indicator. Disable all hover states.

**D. Future off-day cells**
Same invisible treatment as off-days — no orange hover, no interaction.

**E. Past batch-day cells with no data**
Show as a neutral muted style (class was scheduled but attendance not taken). Currently shows same as off-days — needs its own distinct style: `text-muted-foreground/40 bg-muted/20`.

---

### Summary of Visual States

```text
Cell type                          | Appearance
-----------------------------------|-------------------------------------------
Off-day (non-batch weekday)        | Nearly invisible, no interaction
Future off-day                     | Same as above
Future batch day (scheduled)       | Faint, orange glow on hover → Day Off
Today (within edit window)         | Blue, always visible
Today (outside edit window + data) | Green/red like past days
Today (outside window, no data)    | Neutral grey
Past batch day, data, pct ≥ 75%    | Green, tappable
Past batch day, data, pct < 75%    | Red, tappable  
Past batch day, no data recorded   | Neutral grey, not tappable
Column headers for off-day cols    | Faded/dimmed text
```

Only `AttendanceCalendarView.tsx` needs changes. `batchTiming.ts` already exports `isAttendanceEditable` correctly.
