# APEX Logical Data Model

This document defines the **logical/domain model** for APEX before a database or framework is selected.

It is intentionally implementation-neutral. It does not prescribe SQL tables, ORM models, API routes, authentication libraries, or provider-specific fields.

## 1. Design principles

- APEX must have one authoritative identity for each teacher and student.
- Attendance calculations are deterministic and use recorded attendance events/records as their source of truth.
- An attendance QR identifies a temporary attendance session; it does not identify a student.
- The authenticated student's identity supplies the Student ID used for check-in.
- Data-changing operations require validation and, where applicable, an explicit confirmation step.
- External messages must retain enough history to audit what was intended and what was actually sent.
- Spreadsheet files are external data sources; imported/linked spreadsheet metadata must be distinguishable from APEX-owned records.
- AI-generated text or plans are proposals until validated by the application workflow.

## 2. Core entities

### User

Represents an authenticated APEX account.

Required logical attributes:
- user identifier
- display name
- role
- account status
- created timestamp

Roles must be explicitly represented rather than inferred from UI labels.

### Student

Represents a student known to APEX.

Required logical attributes:
- student identifier
- name
- roll number / student ID
- account link, when the student has an APEX account
- status

A student may belong to one or more class/section memberships over time.

### Teacher

Represents the teacher using the teacher workspace.

Required logical attributes:
- teacher identifier
- linked user identifier
- name
- status

### Class / Section

Represents a teaching group such as CSE-A.

Required logical attributes:
- class/section identifier
- name/code
- status

### Subject

Represents an academic subject.

Required logical attributes:
- subject identifier
- name
- code, when applicable
- status

### Enrollment

Connects a student to a class/section for an applicable academic period.

Required logical attributes:
- enrollment identifier
- student identifier
- class/section identifier
- academic-period identifier or equivalent
- status

### Teaching Assignment

Connects a teacher to a class/section and subject.

Required logical attributes:
- assignment identifier
- teacher identifier
- class/section identifier
- subject identifier
- applicable academic period
- status

## 2.1 Department and class management

APEX maintains an explicit academic roster so student identity is not hard-coded into the UI.

### Department / Class / Section

A class/section belongs to a department and has a stable class identifier such as `CSE-A`.

The roster management workflow must support:
- selecting a department/class/section
- adding an active student with a name and roll number/student ID
- marking a student inactive without deleting historical attendance
- creating additional department/section combinations
- using the same roster as the source for attendance workflows

The current desktop prototype stores this roster locally. A shared database and authenticated student identities remain future implementation work.

## 3. Attendance domain

### Attendance Session

Represents one teacher-controlled attendance event.

Required logical attributes:
- session identifier
- teaching assignment identifier
- session date/time
- status
- start timestamp
- end timestamp or expiry
- QR/session reference

The session is the object represented by the QR flow.

### Attendance Record

Represents the attendance result for one student in one attendance session.

Required logical attributes:
- attendance-record identifier
- session identifier
- student identifier
- attendance status
- recorded timestamp
- source

The application must enforce the intended uniqueness rule for a student within a session.

### Attendance Calculation

A derived result, not an independent source of truth.

Examples:
- total sessions applicable to a student
- sessions attended
- sessions missed
- attendance percentage
- threshold status

The exact calculation rules must be implemented deterministically after the attendance data model and academic rules are finalized.

## 4. QR check-in domain

### QR Attendance Session

The QR flow uses the Attendance Session as its authoritative session.

Logical flow:

1. Teacher starts an Attendance Session.
2. APEX creates/activates the session's temporary QR representation.
3. Student scans the QR.
4. APEX resolves the attendance session.
5. APEX authenticates the student account.
6. APEX validates that the student is eligible for the session's class/section.
7. APEX records the student's attendance for that session.
8. APEX prevents duplicate check-in according to the session rule.
9. The session can expire or be explicitly ended by the teacher.

The QR itself must not be treated as proof of student identity.

## 5. Messaging domain

### Message Draft

Represents a message being prepared before sending.

Logical attributes:
- draft identifier
- creator/user identifier
- recipient selection
- channel
- message body
- status
- created/updated timestamps

### Message Recipient

Represents the resolved intended recipient set.

The system should retain enough information to reproduce the recipient preview shown before confirmation.

### Message Delivery

Represents the result of an attempted external delivery.

Logical attributes:
- delivery identifier
- message/draft reference
- external provider reference, when supplied
- delivery status
- attempted timestamp
- result/error information

A draft is not the same thing as a delivery.

## 6. Spreadsheet domain

### Spreadsheet Source

Represents an external or uploaded spreadsheet source.

Logical attributes:
- source identifier
- file/provider reference
- display name
- source type
- connection/import status
- metadata needed to identify the current version

### Spreadsheet Operation

Represents a proposed or executed spreadsheet change.

Logical attributes:
- operation identifier
- source identifier
- operation type
- target information
- proposed change
- status
- confirmation information
- execution result

Spreadsheet changes must be validated before execution.

## 7. Reporting domain

### Report Request

Represents a request to generate a report.

Logical attributes:
- request identifier
- requesting user
- report type
- filters/selection
- requested timestamp
- status

### Report Artifact

Represents a generated report output.

Logical attributes:
- artifact identifier
- report request identifier
- format
- source/version information
- creation timestamp
- storage/download reference

Reports should be generated from validated source data.

## 8. Audit domain

### Audit Event

Represents a significant APEX action.

Examples:
- attendance session started
- attendance record created/updated
- spreadsheet operation proposed
- spreadsheet operation executed
- message draft created
- message send confirmed
- message delivery attempted
- report generated
- settings/security change

Logical attributes:
- event identifier
- actor/user
- action
- target/entity reference
- timestamp
- outcome
- relevant metadata

Do not store secrets or unnecessary sensitive payloads in audit metadata.

## 9. Relationships

Conceptually:

```
User
 ├── Teacher
 │    └── Teaching Assignment
 │          ├── Class / Section
 │          └── Subject
 │
 └── Student account
      └── Student

Student ── Enrollment ── Class / Section

Teaching Assignment
 └── Attendance Session
       └── Attendance Record ── Student

Message Draft
 ├── Message Recipient
 └── Message Delivery

Spreadsheet Source
 └── Spreadsheet Operation

Report Request
 └── Report Artifact

All significant operations
 └── Audit Event
```

## 10. Decisions deliberately left open

The following must **not** be invented until the implementation stack and requirements are verified:

- database engine
- ORM/query layer
- authentication provider
- exact user/student identity schema
- file storage provider
- spreadsheet provider/API
- messaging provider/API
- WhatsApp integration method
- QR encoding/signing format
- QR expiration implementation
- academic-period representation
- exact attendance calculation policy
- report file generation library
- deployment architecture

These are implementation decisions, not logical-domain assumptions.
