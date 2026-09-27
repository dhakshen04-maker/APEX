# APEX Architecture

## Goal

Build a teacher work assistant that reduces repetitive attendance, spreadsheet, reporting, and messaging work.

## High-level components

1. User Interface
   - Teacher dashboard
   - Attendance workflow
   - Spreadsheet workflow
   - Messaging workflow
   - Reports
   - Settings

2. Application Core
   - Request/controller layer
   - Workflow orchestration
   - Validation
   - Confirmation gates
   - Audit/history

3. Data Layer
   - Student records
   - Classes/sections
   - Subjects
   - Attendance records
   - Message history
   - Spreadsheet metadata

4. Integrations
   - Spreadsheet provider/file handling
   - Messaging provider
   - Optional AI provider
   - Optional calendar/scheduling integrations

## Safety and correctness

- Never send a message without showing the intended recipients and message before an irreversible send action.
- Never overwrite attendance or spreadsheet data without validating the target and operation.
- Keep secrets out of source code.
- Prefer deterministic business logic for attendance calculations; AI should not be the source of truth for numeric attendance results.

## Repository research

OpenJarvis, Microsoft JARVIS, and MIRA are reference projects. Their code and APIs must be inspected before any component is adopted.
