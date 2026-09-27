export type AttendanceStatus = "present" | "absent";

export type AttendanceStudent = {
  id: string;
  name: string;
  roll: string;
  sessionsBeforeToday: number;
  attendedBeforeToday: number;
  today: AttendanceStatus;
};

const STORAGE_KEY = "apex.attendance.cse-a.data.v1";

export const seedAttendance: AttendanceStudent[] = [
  { id: "stu-001", name: "Arun Kumar", roll: "23CSE001", sessionsBeforeToday: 21, attendedBeforeToday: 19, today: "present" },
  { id: "stu-002", name: "Divya S", roll: "23CSE002", sessionsBeforeToday: 23, attendedBeforeToday: 21, today: "present" },
  { id: "stu-003", name: "Harish R", roll: "23CSE003", sessionsBeforeToday: 24, attendedBeforeToday: 18, today: "absent" },
  { id: "stu-004", name: "Keerthana P", roll: "23CSE004", sessionsBeforeToday: 23, attendedBeforeToday: 20, today: "present" },
  { id: "stu-005", name: "Manoj K", roll: "23CSE005", sessionsBeforeToday: 24, attendedBeforeToday: 16, today: "absent" },
];

export function loadAttendance(): AttendanceStudent[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedAttendance;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedAttendance;
    return parsed as AttendanceStudent[];
  } catch {
    return seedAttendance;
  }
}

export function saveAttendance(students: AttendanceStudent[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
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
