export type AttendanceStatus = "present" | "absent";

export type AttendanceStudent = {
  id: string;
  name: string;
  roll: string;
  sessionsBeforeToday: number;
  attendedBeforeToday: number;
  today: AttendanceStatus;
};

const seedHistory: Record<string, Pick<AttendanceStudent, "sessionsBeforeToday" | "attendedBeforeToday">> = {
  "stu-001": { sessionsBeforeToday: 21, attendedBeforeToday: 19 },
  "stu-002": { sessionsBeforeToday: 23, attendedBeforeToday: 21 },
  "stu-003": { sessionsBeforeToday: 24, attendedBeforeToday: 18 },
  "stu-004": { sessionsBeforeToday: 23, attendedBeforeToday: 20 },
  "stu-005": { sessionsBeforeToday: 24, attendedBeforeToday: 16 },
};

function storageKey(classId: string) {
  return "apex.attendance." + classId + ".data.v1";
}

export function loadAttendance(
  classId = "CSE-A",
  roster: Array<{ id: string; name: string; roll: string }> = [],
): AttendanceStudent[] {
  try {
    const raw = window.localStorage.getItem(storageKey(classId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const stored = Array.isArray(parsed) ? parsed as AttendanceStudent[] : [];
    const byId = new Map(stored.map((student) => [student.id, student]));

    return roster.map((student) => {
      const existing = byId.get(student.id);
      if (existing) return { ...existing, name: student.name, roll: student.roll };
      const history = seedHistory[student.id] ?? { sessionsBeforeToday: 0, attendedBeforeToday: 0 };
      return { id: student.id, name: student.name, roll: student.roll, ...history, today: "absent" };
    });
  } catch {
    return roster.map((student) => ({
      id: student.id,
      name: student.name,
      roll: student.roll,
      ...(seedHistory[student.id] ?? { sessionsBeforeToday: 0, attendedBeforeToday: 0 }),
      today: "absent",
    }));
  }
}

export function saveAttendance(classId: string, students: AttendanceStudent[]) {
  window.localStorage.setItem(storageKey(classId), JSON.stringify(students));
}

export function getAttendancePercentage(student: AttendanceStudent): number {
  const sessions = student.sessionsBeforeToday + 1;
  const attended = student.attendedBeforeToday + (student.today === "present" ? 1 : 0);
  return Math.round((attended / sessions) * 100);
}

export function getAttendanceSummary(students: AttendanceStudent[]) {
  const present = students.filter((student) => student.today === "present").length;
  const absent = students.length - present;
  const belowThreshold = students.filter((student) => getAttendancePercentage(student) < 75).length;
  const average = students.length
    ? Math.round(students.reduce((sum, student) => sum + getAttendancePercentage(student), 0) / students.length)
    : 0;
  return { present, absent, belowThreshold, average };
}
