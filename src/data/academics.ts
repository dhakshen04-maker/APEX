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

const STORAGE_KEY = "apex.academics.data.v2";

export const seedAcademicData: AcademicData = {
  classes: [
    { id: "CSE-A", department: "CSE", section: "A" },
    { id: "CSE-B", department: "CSE", section: "B" },
    { id: "ECE-A", department: "ECE", section: "A" },
    { id: "EEE-A", department: "EEE", section: "A" },
  ],
  students: [],
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
