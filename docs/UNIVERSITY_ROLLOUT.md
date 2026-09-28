# APEX University Rollout Plan

## Product scope

APEX is a teacher-first academic operations workspace. The current application is local-first and demonstrates roster management, attendance, QR enrollment, QR check-in, reporting, spreadsheets, and messaging workflows.

## Production architecture

```text
Web / Desktop clients
        |
        v
API gateway / application API
        |
  +-----+------+----------------+
  |            |                |
Identity     Academic data    Attendance
service      service          service
  |            |                |
  +------------+----------------+
               |
        PostgreSQL / tenant DB
               |
       Audit + event history
```

## Organization hierarchy

```text
Institution
  -> Campus
    -> Department
      -> Program
        -> Academic year / semester
          -> Course
            -> Section
              -> Students
              -> Faculty
```

Every production record should carry an institution/tenant boundary. Cross-institution reads must be denied by default.

## Roles

- Super Admin: platform-level administration.
- Institution Admin: institution configuration, users, departments, policies and reports.
- HOD / Department Admin: department-level users, classes and analytics.
- Faculty: assigned courses, rosters, attendance and communication.
- Student: own profile, enrolled courses, attendance and notifications.

## QR enrollment flow

1. Faculty selects a class.
2. APEX creates a short-lived enrollment session.
3. The QR contains a non-sensitive session reference, not a password or permanent student identity.
4. Student opens the mobile enrollment page.
5. Student authenticates or verifies identity.
6. Student submits enrollment details.
7. Server validates session, institution, class and duplicate identity.
8. Enrollment enters `pending` state unless the institution policy allows automatic approval.
9. Authorized faculty/admin approves the enrollment.
10. The server writes the roster membership and audit event.

## QR attendance flow

1. Faculty starts a session for a specific class, course and time window.
2. APEX creates a short-lived attendance session.
3. Student authenticates and submits a check-in.
4. Server validates that the student is enrolled in the class and that the session is active.
5. Duplicate check-ins are rejected idempotently.
6. Attendance is recorded with timestamp, session ID and audit metadata.

The QR itself must never be treated as proof of identity.

## Security requirements before production

- Authentication with secure sessions and optional MFA.
- Role-based access control and server-side authorization.
- Tenant isolation on every read/write path.
- Short-lived signed QR/session tokens.
- Replay protection and server-side expiry checks.
- Idempotent attendance writes.
- Audit log for roster, attendance, permission and administrative changes.
- Rate limiting on public enrollment/check-in endpoints.
- HTTPS only.
- No API keys or secrets in the frontend or QR payload.
- Data export and deletion workflows appropriate to institutional policy.
- Backups, recovery testing and operational monitoring.

## Integrations to plan

- University identity provider / SSO.
- Google Workspace and Microsoft 365 where required.
- Student Information System (SIS).
- Learning Management System (LMS).
- Email / notification provider.
- Optional timetable and room systems.

## Demo versus production

The current repository intentionally uses a local-first data model for the desktop demo. Static GitHub Pages enrollment is suitable for demonstrating the user experience, but it does not replace a shared production API/database. A production deployment must move enrollment and attendance validation to the server before an institution relies on the records.

## Recommended delivery order

1. Shared backend and database.
2. Authentication and role model.
3. Server-side QR enrollment/check-in validation.
4. Real-time roster and attendance synchronization.
5. Audit and reporting services.
6. Institution administration.
7. SSO/SIS/LMS integrations.
8. Deployment, monitoring, backups and security review.
