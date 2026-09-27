export type AcademicClass = {
  id: string;
  department: string;
  section: string;
};

export type AcademicStudent = {
  id: string;
  name: string;
  roll: string;
  classId: string;
  status: "active" | "inactive";
};

export type AcademicData = {
  classes: AcademicClass[];
  students: AcademicStudent[];
};

const STORAGE_KEY = "apex.academics.data.v1";

export const seedAcademicData: AcademicData = {
  classes: [
    { id: "CSE-A", department: "CSE", section: "A" },
    { id: "CSE-B", department: "CSE", section: "B" },
    { id: "ECE-A", department: "ECE", section: "A" },
    { id: "EEE-A", department: "EEE", section: "A" },
  ],
  students: [
    { id: "stu-001", name: "Arun Kumar", roll: "23CSE001", classId: "CSE-A", status: "active" },
    { id: "stu-002", name: "Divya S", roll: "23CSE002", classId: "CSE-A", status: "active" },
    { id: "stu-003", name: "Harish R", roll: "23CSE003", classId: "CSE-A", status: "active" },
    { id: "stu-004", name: "Keerthana P", roll: "23CSE004", classId: "CSE-A", status: "active" },
    { id: "stu-005", name: "Manoj K", roll: "23CSE005", classId: "CSE-A", status: "active" },
  ],
};

export function loadAcademicData(): AcademicData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedAcademicData;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return seedAcademicData;
    const data = parsed as Partial<AcademicData>;
    if (!Array.isArray(data.classes) || !Array.isArray(data.students)) return seedAcademicData;
    return data as AcademicData;
  } catch {
    return seedAcademicData;
  }
}

export function saveAcademicData(data: AcademicData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getClassStudents(data: AcademicData, classId: string): AcademicStudent[] {
  return data.students.filter((student) => student.classId === classId && student.status === "active");
}

export function getClassLabel(classItem: AcademicClass): string {
  return classItem.id;
}
