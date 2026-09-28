export type AttendanceIntegrityConfig = {
  qrRotationSeconds: number;
  requireFreshVerification: boolean;
  requireLiveness: boolean;
  preventDuplicates: boolean;
  riskFlagging: boolean;
};

export type AttendanceChallenge = {
  sessionId: string;
  classId: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

const DEFAULT_CONFIG: AttendanceIntegrityConfig = {
  qrRotationSeconds: 10,
  requireFreshVerification: true,
  requireLiveness: true,
  preventDuplicates: true,
  riskFlagging: true,
};

export function getAttendanceIntegrityConfig(): AttendanceIntegrityConfig {
  return { ...DEFAULT_CONFIG };
}

export function createAttendanceChallenge(classId: string, sessionId: string, now = Date.now()): AttendanceChallenge {
  const nonce = crypto.randomUUID().replaceAll("-", "").slice(0, 24);
  return { sessionId, classId, issuedAt: now, expiresAt: now + DEFAULT_CONFIG.qrRotationSeconds * 1000, nonce };
}

export function isChallengeValid(challenge: AttendanceChallenge, now = Date.now()): boolean {
  return now >= challenge.issuedAt && now < challenge.expiresAt;
}

export type IntegritySignals = {
  qrValid: boolean;
  authenticated: boolean;
  freshVerification: boolean;
  livenessVerified: boolean;
  duplicate: boolean;
  classroomSignal?: boolean;
};

export function evaluateIntegrity(signals: IntegritySignals) {
  const hardFailure = !signals.qrValid || !signals.authenticated || !signals.freshVerification || !signals.livenessVerified || signals.duplicate;
  const suspicious = !hardFailure && signals.classroomSignal === false;
  return {
    status: hardFailure ? "rejected" : suspicious ? "suspicious" : "verified",
    reason: hardFailure ? "Attendance integrity requirements were not satisfied." : suspicious ? "The classroom presence signal could not be confirmed." : "Attendance integrity checks passed.",
  } as const;
}
