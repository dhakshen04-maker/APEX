export type AttendanceRisk = "verified" | "suspicious" | "rejected";

export type AttendanceSignals = {
  qrValid: boolean;
  qrAgeMs: number;
  authenticated: boolean;
  duplicate: boolean;
  livePresenceConfirmed: boolean;
  classroomSignal: "present" | "absent" | "unknown";
};

export const QR_ROTATION_MS = 10_000;
export const MAX_QR_AGE_MS = 10_000;

export function evaluateAttendance(signals: AttendanceSignals): { risk: AttendanceRisk; reason: string } {
  if (!signals.qrValid || signals.qrAgeMs < 0 || signals.qrAgeMs >= MAX_QR_AGE_MS) {
    return { risk: "rejected", reason: "The attendance QR has expired or is invalid." };
  }
  if (signals.duplicate) {
    return { risk: "rejected", reason: "Attendance has already been recorded for this session." };
  }
  if (!signals.authenticated) {
    return { risk: "rejected", reason: "Student authentication is required." };
  }
  if (!signals.livePresenceConfirmed) {
    return { risk: "rejected", reason: "Live presence was not confirmed by the teacher." };
  }
  if (signals.classroomSignal === "absent") {
    return { risk: "suspicious", reason: "The classroom-presence signal could not be confirmed." };
  }
  return { risk: "verified", reason: "Fresh QR, authentication and live-presence checks passed." };
}

export function createChallengeId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export function createRotatingQrChallenge(sessionId: string, classId: string, now = Date.now()) {
  return {
    version: 2 as const,
    sessionId,
    classId,
    issuedAt: now,
    expiresAt: now + QR_ROTATION_MS,
    nonce: createChallengeId(),
  };
}

export function isFreshChallenge(createdAt: number, now = Date.now()): boolean {
  return now >= createdAt && now - createdAt < QR_ROTATION_MS;
}
