/**
 * Utility functions for batch timing — shared across attendance pages.
 */

export interface BatchTiming {
  days: string[];
  startHour: number;
  startMinute: number;
  startAmPm: "AM" | "PM";
  endHour: number;
  endMinute: number;
  endAmPm: "AM" | "PM";
}

export function parseBatchTiming(schedule: string | null): BatchTiming | null {
  if (!schedule) return null;
  try {
    const p = JSON.parse(schedule);
    if (p.days && p.startHour != null) return p as BatchTiming;
  } catch { /* legacy */ }
  return null;
}

function to24(h: number, amPm: "AM" | "PM"): number {
  if (amPm === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

/**
 * Returns whether attendance can be edited right now for a given batch.
 * Window: from batch start time to batch end + 2 hours.
 */
export function isAttendanceEditable(schedule: string | null): { editable: boolean; reason: string } {
  const t = parseBatchTiming(schedule);
  if (!t) return { editable: true, reason: "" }; // No timing set — allow

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const startH24 = to24(t.startHour, t.startAmPm);
  const endH24 = to24(t.endHour, t.endAmPm);

  const startMins = startH24 * 60 + t.startMinute;
  const endMins = endH24 * 60 + t.endMinute;
  const cutoffMins = endMins + 120; // +2 hours

  const fmt = (h: number, m: number, ap: string) => `${h}:${String(m).padStart(2, "0")} ${ap}`;

  if (nowMins < startMins) {
    return {
      editable: false,
      reason: `Attendance opens at ${fmt(t.startHour, t.startMinute, t.startAmPm)} (class start time).`,
    };
  }
  if (nowMins > cutoffMins) {
    const cutH = Math.floor(cutoffMins / 60);
    const cutM = cutoffMins % 60;
    const cutAp = cutH >= 12 ? "PM" : "AM";
    const cutH12 = cutH > 12 ? cutH - 12 : cutH === 0 ? 12 : cutH;
    return {
      editable: false,
      reason: `Attendance window closed at ${cutH12}:${String(cutM).padStart(2, "0")} ${cutAp} (2 hrs after class end).`,
    };
  }

  return { editable: true, reason: "" };
}

export function formatTimingDisplay(schedule: string | null): string {
  const t = parseBatchTiming(schedule);
  if (!t) return schedule || "";
  const days = t.days.join(", ");
  const fmt = (h: number, m: number, ap: string) => `${h}:${String(m).padStart(2, "0")} ${ap}`;
  return `${days} · ${fmt(t.startHour, t.startMinute, t.startAmPm)} – ${fmt(t.endHour, t.endMinute, t.endAmPm)}`;
}
