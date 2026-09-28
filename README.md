# APEX

APEX is a teacher-focused AI work assistant for college workflows, with an expanding institution platform for universities, colleges, and training organizations.

## Current product surfaces

- **Teacher workspace** — attendance, student/class management, QR enrollment, QR attendance, spreadsheets, messaging, and reports.
- **Student enrollment** — browser-based QR enrollment flow for adding students to a class roster.
- **Attendance check-in** — browser-based student check-in flow for teacher-controlled attendance sessions.
- **Institution console** — institution-level people, academics, security, integrations, and reporting surface.
- **Enterprise platform preview** — broader modules such as admissions, exams, fees, hostel/transport, library, placements, student support, analytics, identity, and AI-assisted operations.

## QR attendance model

The QR code identifies the **attendance session**, not the student's identity.

1. The teacher starts an attendance session for a class.
2. APEX generates a temporary QR for that session.
3. The student scans the session QR.
4. The student is identified through the authenticated student account in a production backend.
5. APEX associates the Student ID with the Session ID.
6. The attendance record is saved after validation.

For the current demo/local-first implementation, the QR flow is designed to demonstrate the complete workflow without requiring a production institution backend.

### Attendance-session safeguards

The production design should include:

- Short session expiry
- One check-in per student per session
- Authenticated student accounts
- Class/section validation
- Optional rotating QR codes
- Teacher-controlled session start/end
- Audit logs for attendance changes

The QR itself should never be treated as proof of student identity. Identity should come from the authenticated student account.

## Institution / enterprise scope

APEX is being designed as a modular institutional platform rather than only an attendance app. Planned/previewed modules include:

- Student Information System integration
- Admissions and onboarding
- Departments, programs, semesters, subjects, sections and faculty assignment
- Attendance and low-attendance intervention
- Exams, assessments and results
- Timetables and room operations
- Student/faculty communication
- Fees and finance integration
- Hostel and transport operations
- Library integration
- Placement/career workflows
- Mentoring, grievances and student support
- Institution analytics and reports
- Role-based access and audit trails
- Google Workspace / Microsoft Entra identity integration
- Controlled APEX AI Copilot for staff workflows

See the product surface at `enterprise.html` and the administrator demo at `institution.html`.

## Safety rules

1. Verify repository code, APIs, dependencies, and file paths before making implementation claims.
2. Do not invent APIs, functions, files, or integrations.
3. Actions that modify attendance/spreadsheets or send messages must support an explicit confirmation step.
4. Keep the application modular and suitable for modest hardware.
5. Treat external repositories as references/components to inspect, not as code to copy blindly.
6. Production institutional deployment requires authenticated backend services, approved integrations, security review, privacy controls, backup/recovery, and data-retention policies.

## Development

```bash
npm install
npm run build
npm run dev
npm run tauri dev
```

The GitHub Pages workflow builds the web demo on pushes to `main`. A separate quality workflow runs the production TypeScript/Vite build on pushes and pull requests so broken changes are caught before they become the demo build.

## Current status

The local-first teacher workflow and QR demonstration are functional. The next production phase is the shared authenticated backend and institution integrations. The enterprise UI intentionally separates **demo/preview surfaces** from claims of production data connectivity.
