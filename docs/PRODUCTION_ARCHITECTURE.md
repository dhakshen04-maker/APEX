# APEX Production Architecture

This document defines the next implementation layer for turning the current local-first APEX demo into a multi-user institutional product.

## 1. Tenancy

Use an explicit institution boundary on every server-side record:

```text
Institution
  ├─ Campus
  ├─ Department
  │   ├─ Program
  │   └─ Section
  ├─ Users
  │   ├─ Administrator
  │   ├─ HOD
  │   ├─ Faculty
  │   └─ Student
  └─ Academic terms
```

Every request must resolve an authenticated user and institution before reading or changing institutional data.

## 2. Core server entities

Minimum production entities:

- institutions
- campuses
- departments
- programs
- academic_terms
- sections
- subjects
- rooms
- users
- student_profiles
- faculty_profiles
- enrollments
- teaching_assignments
- attendance_sessions
- attendance_records
- qr_enrollment_tokens
- messages
- reports
- audit_events

## 3. Attendance flow

```text
Teacher authenticates
      ↓
Select class + subject + term
      ↓
Create attendance_session
      ↓
Server creates short-lived session token
      ↓
Student scans QR
      ↓
Student authenticates
      ↓
Server validates institution + class + session + expiry
      ↓
Unique constraint prevents duplicate check-in
      ↓
attendance_record = present
      ↓
Audit event written
```

The QR should identify the session. Student identity must come from the authenticated account.

## 4. QR enrollment flow

```text
Teacher selects class
      ↓
Server creates short-lived enrollment token
      ↓
Student scans public enrollment URL
      ↓
Student authenticates or completes institution-approved identity step
      ↓
Server validates token + class + expiry
      ↓
Student profile / enrollment created or matched
      ↓
Teacher sees pending enrollment
      ↓
Teacher confirms if institution policy requires approval
```

Do not allow a public QR token alone to create unrestricted institutional access.

## 5. Permissions

Recommended permission boundaries:

| Role | Typical access |
| --- | --- |
| Administrator | Institution-wide configuration, people, audit, integrations, reports |
| HOD | Department students, faculty, subjects, attendance and reports |
| Faculty | Assigned classes, attendance, messaging and teaching reports |
| Student | Own profile, own attendance, approved student services |

Server-side authorization must enforce these boundaries; hiding UI buttons is not sufficient.

## 6. Audit events

Record important changes such as:

- attendance created/edited/deleted
- student added/removed from a section
- faculty assignment changed
- department or academic configuration changed
- message sent
- report generated
- role/permission changed
- integration configuration changed

Each event should contain actor, institution, action, target, timestamp and request/session metadata appropriate to the institution's privacy policy.

## 7. Integrations

Keep integrations behind adapters so the core domain does not depend directly on a single vendor:

```text
APEX domain
   ├─ Identity adapter → Google / Microsoft / SAML / OIDC
   ├─ SIS adapter      → institution ERP/SIS
   ├─ LMS adapter      → approved LMS
   ├─ Mail adapter     → institutional email
   └─ Calendar adapter → institutional calendar
```

Integration credentials must remain server-side. Never ship institution secrets in the React/Tauri client.

## 8. Data and privacy

Before production rollout, define:

- data retention periods
- backup and restore policy
- export/delete procedures
- access review process
- incident response
- encryption requirements
- institution-specific privacy/legal requirements

These policies must be finalized with the institution rather than assumed by the demo application.

## 9. Client architecture

The existing React/Vite/Tauri client should remain lightweight. Keep domain logic in reusable modules and move shared institutional state to the backend when multi-user synchronization is introduced.

Local storage can remain as an offline/demo cache, but server data must be treated as authoritative once an authenticated backend is connected.

## 10. Recommended implementation order

1. Authentication + institution tenancy
2. Database schema + row-level authorization
3. Student/class synchronization
4. Attendance sessions + QR validation
5. Audit logging
6. Teacher/HOD/admin permissions
7. Messaging and report APIs
8. SIS/LMS/identity adapters
9. Offline synchronization and conflict handling
10. Institutional deployment, backup, monitoring and security review

This order keeps the attendance/QR demonstration useful while building toward a real multi-user institutional product without pretending the current local-first demo is already a production backend.
