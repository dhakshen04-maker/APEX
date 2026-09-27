# APEX

APEX is a teacher-focused AI work assistant for college workflows.

## Initial scope

- Attendance recording and attendance data management
- Spreadsheet assistance
- Student and class/group messaging
- Reports and summaries
- Natural-language assistance for teacher workflows

## Attendance with QR Check-In

APEX will support QR-based attendance as a planned attendance workflow.

### How APEX knows which student scanned

The QR code identifies the **attendance session**, not the individual student.

1. Each student has an APEX account/profile containing their identity information, such as:
   - Student name
   - Roll number / Student ID
   - Class / section
2. The teacher starts an attendance session in APEX.
3. APEX generates a temporary QR code for that specific class and session.
4. A student scans the QR code and opens the APEX check-in page.
5. The student must be authenticated to their APEX account.
6. APEX associates the authenticated Student ID with the attendance Session ID.
7. APEX records that student as present for that session.

Conceptually:

```text
QR Code
   ↓
Attendance Session
   ↓
Student scans
   ↓
APEX checks authenticated student
   ↓
Student ID + Session ID are matched
   ↓
Attendance recorded
```

Example:

```text
Arun
CSE-A
Student ID: 23CSE001

        ↓ scans class QR

APEX Attendance Session
Data Structures
27 Sep 2026
        ↓

23CSE001 → Present
```

### Attendance-session safeguards

The QR workflow should be designed with safeguards so that a shared QR code cannot simply be reused without validation. Planned safeguards include:

- Short QR/session expiry
- One check-in per student per session
- Authenticated student accounts
- Class/section validation
- Optional rotating QR codes
- Teacher-controlled attendance start/end and session locking

### Important design rule

The QR code itself should **not** be treated as proof of a student's identity. Identity comes from the authenticated student account, while the QR identifies the attendance session.

The exact authentication, QR format, expiry mechanism, and anti-sharing measures will be finalized after the application stack and backend are verified.

## Project rules

1. Verify repository code, APIs, dependencies, and file paths before making implementation claims.
2. Do not invent APIs, functions, files, or integrations.
3. Actions that modify attendance/spreadsheets or send messages must support an explicit confirmation step.
4. Keep the application modular and suitable for modest hardware.
5. Treat external repositories as references/components to inspect, not as code to copy blindly.

## Reference repositories

- OpenJarvis: agent and local-first assistant architecture
- Microsoft JARVIS: task planning and tool/model orchestration
- MIRA: TypeScript/React/Vite/Tauri desktop assistant foundation

## Current status

Repository initialized. Implementation will proceed incrementally after the architecture and UI requirements are verified.
