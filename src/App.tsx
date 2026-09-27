import { useMemo, useState, type ReactNode } from "react";
import qrcode from "qrcode-generator";
import { getAttendancePercentage, getAttendanceSummary, loadAttendance, saveAttendance, type AttendanceStudent } from "./data/attendance";
import { getClassLabel, getClassStudents, loadAcademicData, saveAcademicData, type AcademicClass, type AcademicData } from "./data/academics";

type Workspace = "dashboard" | "attendance" | "students" | "spreadsheets" | "messaging" | "reports" | "qr" | "enroll";

const navItems: Array<{ id: Workspace; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "attendance", label: "Attendance" },
  { id: "students", label: "Students" },
  { id: "spreadsheets", label: "Spreadsheets" },
  { id: "messaging", label: "Messaging" },
  { id: "reports", label: "Reports" },
];

function Orb() {
  return (
    <div className="orb-shell" aria-label="APEX assistant">
      <div className="orb">
        <span />
        <span />
      </div>
    </div>
  );
}

function Icon({ name }: { name: "arrow" | "plus" | "search" | "download" | "send" | "qr" | "copy" | "sheet" }) {
  const paths: Record<string, ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    download: <><path d="M12 4v11M8 11l4 4 4-4" /><path d="M5 20h14" /></>,
    send: <><path d="m4 5 16 7-16 7 3-7-3-7Z" /><path d="M7 12h13" /></>,
    qr: <><path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" /><path d="M14 14h3v3h-3zM18 18h1v1h-1z" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    sheet: <><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Button({ children, variant = "secondary", onClick, icon }: { children: string; variant?: "primary" | "secondary" | "ghost"; onClick?: () => void; icon?: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <button className={`button button-${variant}`} type="button" onClick={onClick}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

function Shell({ workspace, setWorkspace, children }: { workspace: Workspace; setWorkspace: (workspace: Workspace) => void; children: ReactNode }) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setWorkspace("dashboard")} aria-label="Open APEX dashboard">
          <Orb />
          <span><strong>APEX</strong><small>Teacher workspace</small></span>
        </button>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item.id} className={workspace === item.id ? "active" : ""} type="button" onClick={() => setWorkspace(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="profile">Teacher · CSE-A</div>
      </header>
      {children}
    </main>
  );
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <section className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
      {action}
    </section>
  );
}

function Dashboard({ setWorkspace }: { setWorkspace: (workspace: Workspace) => void }) {
  const workflows: Array<{ id: Workspace; title: string; detail: string; kicker: string }> = [
    { id: "attendance", title: "Attendance", detail: "Take attendance, start QR sessions, and review percentages.", kicker: "01" },
    { id: "spreadsheets", title: "Spreadsheets", detail: "Inspect attendance sheets and prepare safe updates.", kicker: "02" },
    { id: "messaging", title: "Messaging", detail: "Draft reminders and announcements with review before send.", kicker: "03" },
    { id: "reports", title: "Reports", detail: "Generate clear reports from validated attendance data.", kicker: "04" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="TEACHER WORK ASSISTANT"
        title="Good evening. What should APEX handle?"
        subtitle="Attendance, spreadsheets, messaging, and reports in one focused workspace."
        action={<Button variant="primary" onClick={() => setWorkspace("attendance")}>Open APEX Assistant</Button>}
      />
      <section className="workflow-grid">
        {workflows.map((workflow) => (
          <button className="workflow-card" key={workflow.id} type="button" onClick={() => setWorkspace(workflow.id)}>
            <span className="card-index">{workflow.kicker}</span>
            <span className="card-title">{workflow.title}</span>
            <span className="card-detail">{workflow.detail}</span>
            <span className="card-link">Open workspace <Icon name="arrow" /></span>
          </button>
        ))}
      </section>
      <section className="safety-banner">
        <div><p className="eyebrow">APEX SAFETY</p><strong>Review before APEX changes data or sends messages.</strong><span>Actions that modify records or communicate externally use a confirmation step.</span></div>
        <span className="status-dot">Ready</span>
      </section>
    </>
  );
}

function Attendance({
  students,
  setStudents,
  setWorkspace,
  classes,
  classId,
  onClassChange,
}: {
  students: AttendanceStudent[];
  setStudents: (students: AttendanceStudent[]) => void;
  setWorkspace: (workspace: Workspace) => void;
  classes: AcademicClass[];
  classId: string;
  onClassChange: (classId: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const summary = getAttendanceSummary(students);
  const visible = useMemo(
    () => filter === "low" ? students.filter((student) => getAttendancePercentage(student) < 75) : students,
    [filter, students],
  );

  const applyAttendance = (draft: AttendanceStudent[]) => {
    setStudents(draft);
    saveAttendance(classId, draft);
    setEditorOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="ATTENDANCE"
        title="Attendance"
        subtitle="Take attendance, review percentages, and find students who need attention."
        action={<Button variant="primary" icon="qr" onClick={() => setWorkspace("qr")}>Start QR attendance</Button>}
      />
      <section className="control-row">
        <select aria-label="Class" value={classId} onChange={(event) => onClassChange(event.target.value)}>
          {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{getClassLabel(classItem)}</option>)}
        </select>
        <select aria-label="Subject"><option>Data Structures</option><option>Operating Systems</option></select>
        <button className="date-chip" type="button">27 Sep 2026 · Today</button>
        <span className="control-spacer" />
        <Button icon="sheet" onClick={() => setWorkspace("spreadsheets")}>Open spreadsheet</Button>
      </section>
      <section className="metric-grid">
        <Metric label="Present" value={String(summary.present)} meta={`of ${students.length} loaded students`} />
        <Metric label="Absent" value={String(summary.absent)} meta="today" />
        <Metric label="Average" value={`${summary.average}%`} meta="calculated from records" />
        <Metric label="Below threshold" value={String(summary.belowThreshold)} meta="below 75%" />
      </section>
      <section className="workspace-layout">
        <div className="panel table-panel">
          <div className="panel-head">
            <div><p className="eyebrow">TODAY'S RECORD</p><h2>{classId} · Data Structures</h2></div>
            <div className="panel-head-actions">
              <Button icon="plus" onClick={() => setWorkspace("students")}>Add student</Button>
              <span className="pill">Local draft</span>
            </div>
          </div>
          <div className="table-tools">
            <Button variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>All students</Button>
            <Button variant={filter === "low" ? "primary" : "secondary"} onClick={() => setFilter("low")}>Below 75%</Button>
          </div>
          {students.length === 0 ? (
            <div className="empty-roster">
              <div className="empty-roster-icon"><Icon name="plus" /></div>
              <strong>No students added to {classId} yet</strong>
              <span>Add the students for this class before taking attendance. Their names and roll numbers will appear here automatically.</span>
              <Button variant="primary" icon="plus" onClick={() => setWorkspace("students")}>Add students</Button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Roll no.</th><th>Today</th><th>Attendance</th></tr></thead>
                <tbody>
                  {visible.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td className="muted">{student.roll}</td>
                      <td><span className={`attendance-state ${student.today}`}>{student.today === "present" ? "Present" : "Absent"}</span></td>
                      <td>{getAttendancePercentage(student)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="data-note">This first functional slice stores attendance locally in this APEX installation. It is not yet connected to a shared database.</div>
        </div>
        <aside className="panel action-panel">
          <p className="eyebrow">ATTENDANCE ACTIONS</p>
          <Button variant="primary" onClick={() => students.length ? setEditorOpen(true) : setWorkspace("students")} icon={students.length ? undefined : "plus"}>{students.length ? "Mark attendance" : "Add students"}</Button>
          <Button onClick={() => setWorkspace("qr")} icon="qr">Start QR session</Button>
          <Button onClick={() => setFilter("low")}>Find low-attendance students</Button>
          <Button onClick={() => setWorkspace("reports")} icon="download">Generate report</Button>
          <div className="mini-note">Changes are saved locally after confirmation. Shared accounts/database will be added after the data layer is selected.</div>
        </aside>
      </section>
      {editorOpen ? (
        <AttendanceEditor students={students} onCancel={() => setEditorOpen(false)} onSave={applyAttendance} />
      ) : null}
    </>
  );
}

function AttendanceEditor({
  students,
  onCancel,
  onSave,
}: {
  students: AttendanceStudent[];
  onCancel: () => void;
  onSave: (students: AttendanceStudent[]) => void;
}) {
  const [draft, setDraft] = useState<AttendanceStudent[]>(students);

  const toggle = (id: string) => {
    setDraft((current) => current.map((student) =>
      student.id === id
        ? { ...student, today: student.today === "present" ? "absent" : "present" }
        : student,
    ));
  };

  const summary = getAttendanceSummary(draft);

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="confirm-modal attendance-editor" role="dialog" aria-modal="true">
        <p className="eyebrow">MARK ATTENDANCE</p>
        <h2>CSE-A · Data Structures</h2>
        <p>Review each student's status. APEX will save the confirmed attendance record locally.</p>
        <div className="editor-summary">
          <span><strong>{summary.present}</strong> Present</span>
          <span><strong>{summary.absent}</strong> Absent</span>
        </div>
        <div className="editor-list">
          {draft.map((student) => (
            <button className="editor-row" type="button" key={student.id} onClick={() => toggle(student.id)}>
              <span><strong>{student.name}</strong><small>{student.roll}</small></span>
              <span className={`attendance-state ${student.today}`}>{student.today === "present" ? "Present" : "Absent"}</span>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(draft)}>Confirm & save</Button>
        </div>
      </div>
    </div>
  );
}
function Metric({ label, value, meta }: { label: string; value: string; meta: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>;
}


function Students({
  data,
  setData,
  selectedClassId,
  setSelectedClassId,
  refreshAttendance,
}: {
  data: AcademicData;
  setData: (data: AcademicData) => void;
  selectedClassId: string;
  setSelectedClassId: (classId: string) => void;
  refreshAttendance: (classId: string, dataOverride?: AcademicData) => void;
}) {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newSection, setNewSection] = useState("");
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const selectedClass = data.classes.find((item) => item.id === selectedClassId) ?? data.classes[0];
  const classStudents = selectedClass ? getClassStudents(data, selectedClass.id) : [];

  const addStudent = () => {
    const cleanName = name.trim();
    const cleanRoll = roll.trim();
    if (!selectedClass || !cleanName || !cleanRoll) return;
    if (data.students.some((student) => student.classId === selectedClass.id && student.roll.toLowerCase() === cleanRoll.toLowerCase() && student.status === "active")) return;

    const next: AcademicData = {
      ...data,
      students: [
        ...data.students,
        {
          id: "stu-" + Date.now(),
          name: cleanName,
          roll: cleanRoll,
          classId: selectedClass.id,
          status: "active",
        },
      ],
    };
    setData(next);
    setName("");
    setRoll("");
    setConfirmAdd(false);
    refreshAttendance(selectedClass.id, next);
  };

  const removeStudent = (studentId: string) => {
    const next: AcademicData = {
      ...data,
      students: data.students.map((student) => student.id === studentId ? { ...student, status: "inactive" } : student),
    };
    setData(next);
    setConfirmRemove(null);
    refreshAttendance(selectedClass.id, next);
  };

  const addClass = () => {
    const department = newDepartment.trim().toUpperCase();
    const section = newSection.trim().toUpperCase();
    if (!department || !section) return;
    const id = department + "-" + section;
    if (data.classes.some((item) => item.id === id)) return;

    const next: AcademicData = {
      ...data,
      classes: [...data.classes, { id, department, section }],
    };
    setData(next);
    setSelectedClassId(id);
    setNewDepartment("");
    setNewSection("");
  };

  return (
    <>
      <PageHeader
        eyebrow="STUDENTS & CLASSES"
        title="Class management"
        subtitle="Add your real student roster and organize students by department and section."
        action={<div className="page-actions"><Button icon="qr" onClick={() => setWorkspace("enroll")}>QR enrollment</Button><Button variant="primary" icon="plus" onClick={() => setConfirmAdd(true)}>Add student</Button></div>}
      />

      <section className="class-toolbar">
        <div>
          <p className="eyebrow">SELECT CLASS</p>
          <select value={selectedClass?.id ?? ""} onChange={(event) => setSelectedClassId(event.target.value)} aria-label="Student class">
            {data.classes.map((item) => <option key={item.id} value={item.id}>{item.department} · {item.section}</option>)}
          </select>
        </div>
        <div className="class-count">
          <strong>{classStudents.length}</strong>
          <span>active students</span>
        </div>
      </section>

      <section className="student-management-grid">
        <div className="panel table-panel">
          <div className="panel-head">
            <div><p className="eyebrow">ROSTER</p><h2>{selectedClass ? selectedClass.department + " · " + selectedClass.section : "No class selected"}</h2></div>
            <span className="pill">{classStudents.length} students</span>
          </div>
          {classStudents.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Roll no.</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {classStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td className="muted">{student.roll}</td>
                      <td><span className="attendance-state present">Active</span></td>
                      <td><button className="table-action" type="button" onClick={() => setConfirmRemove(student.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-roster">
              <strong>No students added yet.</strong>
              <span>Add students manually now. Spreadsheet import will be added as the next roster input method.</span>
              <Button variant="primary" icon="plus" onClick={() => setConfirmAdd(true)}>Add first student</Button>
            </div>
          )}
          <div className="data-note">Roster data is stored locally in this APEX installation. It will become shared account/database data when the backend is implemented.</div>
        </div>

        <aside className="panel action-panel">
          <p className="eyebrow">ROSTER INPUTS</p>
          <Button variant="primary" icon="qr" onClick={() => setWorkspace("enroll")}>Add students with QR</Button>
          <p className="action-description">Generate one temporary enrollment QR for this selected class. Students can scan it from their phones.</p>
          <p className="eyebrow">ADD DEPARTMENT / SECTION</p>
          <label>Department<input className="text-input" value={newDepartment} onChange={(event) => setNewDepartment(event.target.value)} placeholder="e.g. CSE" /></label>
          <label>Section<input className="text-input" value={newSection} onChange={(event) => setNewSection(event.target.value)} placeholder="e.g. A" /></label>
          <Button variant="primary" onClick={addClass}>Create class</Button>
          <div className="class-list">
            {data.classes.map((item) => <span key={item.id}>{item.department} · {item.section}</span>)}
          </div>
          <div className="mini-note">Example sections are included only to demonstrate the structure. Replace them with your institution's real departments and sections.</div>
        </aside>
      </section>

      {confirmAdd ? (
        <div className="modal-backdrop" role="presentation">
          <div className="confirm-modal" role="dialog" aria-modal="true">
            <p className="eyebrow">ADD STUDENT</p>
            <h2>{selectedClass ? selectedClass.department + " · " + selectedClass.section : "Class"}</h2>
            <label>Student name<input className="text-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" autoFocus /></label>
            <label>Roll number / Student ID<input className="text-input" value={roll} onChange={(event) => setRoll(event.target.value)} placeholder="e.g. 23CSE001" /></label>
            <div className="modal-actions">
              <Button onClick={() => setConfirmAdd(false)}>Cancel</Button>
              <Button variant="primary" onClick={addStudent}>Add student</Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmRemove ? (
        <Confirm
          title="Remove this student?"
          detail="The student will be marked inactive in this local roster. Existing attendance history is not deleted by this action."
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => removeStudent(confirmRemove)}
          confirmLabel="Remove student"
        />
      ) : null}
    </>
  );
}

function Spreadsheets({ students }: { students: AttendanceStudent[] }) {
  const [saved, setSaved] = useState(false);
  const summary = getAttendanceSummary(students);

  return (
    <>
      <PageHeader eyebrow="SPREADSHEETS" title="Spreadsheets" subtitle="Open attendance sheets, inspect student data, make safe updates, and generate clean reports." action={<Button variant="primary" icon="sheet">Select spreadsheet</Button>} />
      <section className="control-row"><button className="date-chip" type="button">Attendance · CSE-A</button><Button icon="search">Search students</Button><Button>Filter</Button><span className="control-spacer" /><Button variant="primary" onClick={() => setSaved(true)}>Save changes</Button></section>
      <section className="workspace-layout">
        <div className="panel table-panel">
          <div className="panel-head"><div><p className="eyebrow">ATTENDANCE DATA</p><h2>CSE-A · Current session</h2><span className="panel-meta">{students.length} loaded students · {summary.present} present · {summary.absent} absent</span></div>{saved ? <span className="pill success">Saved locally</span> : <span className="pill">Local data</span>}</div>
          <div className="table-wrap spreadsheet"><table><thead><tr><th>Student</th><th>Roll no.</th><th>Today</th><th>Attendance %</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.name}</td><td className="muted">{student.roll}</td><td><span className={`attendance-state ${student.today}`}>{student.today === "present" ? "Present" : "Absent"}</span></td><td>{getAttendancePercentage(student)}%</td></tr>)}</tbody></table></div>
          <div className="data-note">Spreadsheet import/export is the next integration layer. These rows currently come from APEX's local attendance store.</div>
        </div>
        <aside className="panel action-panel"><p className="eyebrow">SPREADSHEET ACTIONS</p><Button icon="search">Find student</Button><Button>Sort attendance</Button><Button>Calculate percentages</Button><Button icon="download">Generate report</Button><div className="mini-note">No external spreadsheet is connected yet.</div></aside>
      </section>
    </>
  );
}
function Messaging() {
  const [channel, setChannel] = useState("WhatsApp");
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("Reminder: the Data Structures assignment is due tomorrow. Please submit it before 5:00 PM.");
  return (
    <>
      <PageHeader eyebrow="MESSAGING" title="Messaging" subtitle="Draft reminders and announcements, then review exactly what APEX will send." />
      <section className="message-layout">
        <div className="panel composer">
          <div className="panel-head"><div><p className="eyebrow">NEW MESSAGE</p><h2>Assignment reminder</h2></div><span className="pill">Draft</span></div>
          <label>Recipients<select><option>CSE-A · 58 students</option><option>Data Structures · 58 students</option></select></label>
          <label>Channel<div className="segmented">{["WhatsApp", "Email"].map((item) => <button key={item} className={channel === item ? "selected" : ""} type="button" onClick={() => setChannel(item)}>{item}</button>)}</div></label>
          <label>Message<textarea value={message} onChange={(event) => setMessage(event.target.value)} /></label>
          <div className="natural-hint">Try: “Send CSE-A a reminder that the assignment is due tomorrow.”</div>
          <Button variant="primary" icon="send" onClick={() => setReview(true)}>Review message</Button>
        </div>
        <aside className="panel recent-panel"><p className="eyebrow">RECENT MESSAGES</p><div className="recent-item"><strong>Internal class reminder</strong><span>Yesterday · CSE-A · {channel}</span></div><div className="recent-item"><strong>Exam announcement</strong><span>23 Sep · CSE-A · Email</span></div><div className="send-safety"><strong>Before Send</strong><span>APEX shows recipients, channel, and the exact message before anything is sent.</span></div></aside>
      </section>
      {review ? <Confirm title="Review message before send" detail={`${channel} · CSE-A · 58 students\n\n${message}`} onCancel={() => setReview(false)} onConfirm={() => setReview(false)} confirmLabel="Confirm send" /> : null}
    </>
  );
}

function Reports({ students }: { students: AttendanceStudent[] }) {
  const summary = getAttendanceSummary(students);
  return (
    <>
      <PageHeader eyebrow="REPORTS" title="Reports" subtitle="Generate clear reports from validated attendance data, with a preview before export." action={<Button variant="primary" icon="download">Export report</Button>} />
      <section className="control-row"><select aria-label="Class"><option>CSE-A</option></select><select aria-label="Subject"><option>Data Structures</option></select><button className="date-chip" type="button">27 Sep 2026 · Today</button><span className="control-spacer" /><span className="pill">Calculated locally</span></section>
      <section className="metric-grid"><Metric label="Loaded" value={String(students.length)} meta="students" /><Metric label="Present" value={String(summary.present)} meta="today" /><Metric label="Absent" value={String(summary.absent)} meta="today" /><Metric label="Average" value={`${summary.average}%`} meta="attendance" /></section>
      <section className="report-grid"><div className="panel report-preview"><div className="panel-head"><div><p className="eyebrow">REPORT PREVIEW</p><h2>Attendance summary · CSE-A</h2></div><span className="pill">Validated calculation</span></div><div className="report-bars"><div><span>Average attendance</span><strong>{summary.average}%</strong><i style={{ width: `${summary.average}%` }} /></div><div><span>Below 75%</span><strong>{summary.belowThreshold} students</strong><i style={{ width: `${Math.min(100, (summary.belowThreshold / Math.max(1, students.length)) * 100)}%` }} /></div></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Roll no.</th><th>Attendance</th><th>Status</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.name}</td><td className="muted">{student.roll}</td><td>{getAttendancePercentage(student)}%</td><td><span className={`attendance-state ${getAttendancePercentage(student) < 75 ? "absent" : "present"}`}>{getAttendancePercentage(student) < 75 ? "Needs attention" : "On track"}</span></td></tr>)}</tbody></table></div></div><aside className="panel action-panel"><p className="eyebrow">REPORT ACTIONS</p><Button variant="primary" icon="download">Export PDF</Button><Button icon="sheet">Export spreadsheet</Button><Button>Filter below 75%</Button><div className="mini-note">Export remains a UI action until the report/file generation layer is implemented.</div></aside></section>
    </>
  );
}
function EnrollmentQR({ classId, classes, setWorkspace }: { classId: string; classes: AcademicClass[]; setWorkspace: (workspace: Workspace) => void }) {
  const [session, setSession] = useState(() => createEnrollmentSession(classId));
  const selectedClass = classes.find((item) => item.id === session.classId) ?? classes[0];
  const qrSvg = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(session.payload);
    qr.make();
    return qr.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
  }, [session.payload]);

  const regenerate = () => setSession(createEnrollmentSession(classId));

  const copyToken = async () => {
    await navigator.clipboard.writeText(session.token);
  };

  return (
    <>
      <PageHeader
        eyebrow="STUDENT ENROLLMENT · QR"
        title="Add students with QR"
        subtitle="Generate a temporary enrollment QR for a class. The QR carries only a short-lived enrollment token and class identifier."
        action={<div className="page-actions"><Button onClick={() => setWorkspace("students")}>Back to students</Button><Button variant="primary" icon="qr" onClick={regenerate}>New QR</Button></div>}
      />
      <section className="qr-layout enrollment-layout">
        <div className="panel session-panel enrollment-session">
          <p className="eyebrow">ENROLLMENT QR</p>
          <div className="enrollment-class">
            <span>Class</span>
            <strong>{selectedClass ? selectedClass.department + " · " + selectedClass.section : session.classId}</strong>
          </div>
          <div className="enrollment-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <strong className="qr-ready">Ready for student scans</strong>
          <span className="qr-helper">Expires in 10 minutes · regenerate to invalidate the current token</span>
        </div>
        <aside className="panel live-panel enrollment-info">
          <p className="eyebrow">HOW IT WORKS</p>
          <ol className="enrollment-steps">
            <li>Show this QR to the class.</li>
            <li>Each student scans it on their phone.</li>
            <li>APEX uses the class ID and temporary token to start enrollment.</li>
            <li>Student identity is then verified before the roster is changed.</li>
          </ol>
          <div className="enrollment-token">
            <span>Session token</span>
            <strong>{session.token}</strong>
            <Button icon="copy" onClick={copyToken}>Copy token</Button>
          </div>
          <div className="send-safety">
            <strong>Important</strong>
            <span>The desktop app currently generates and displays the real QR payload. A phone-to-desktop enrollment endpoint is the next integration step; we are not pretending a local Tauri screen is reachable from a student's phone.</span>
          </div>
        </aside>
      </section>
    </>
  );
}

function createEnrollmentSession(classId: string) {
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  return {
    classId,
    token,
    payload: `APEX-ENROLL-V1|class=${classId}|token=${token}|expires=${expiresAt}`,
  };
}

function QRSession() {
  const [active, setActive] = useState(true);
  return (
    <>
      <PageHeader eyebrow="ATTENDANCE · QR" title="QR attendance" subtitle="Start a temporary class session and let authenticated students check in by scanning the QR." action={<Button variant="secondary" onClick={() => setActive(false)}>{active ? "End session" : "Session ended"}</Button>} />
      <section className="qr-layout">
        <div className="panel session-panel"><p className="eyebrow">SESSION SETUP</p><div className="session-grid"><span>Class<strong>CSE-A</strong></span><span>Subject<strong>Data Structures</strong></span><span>Date<strong>27 Sep 2026</strong></span><span>Duration<strong>10 minutes</strong></span><span>Session ID<strong>DS-CSEA-2709</strong></span></div><div className="qr-code"><div className="qr-pattern">{Array.from({ length: 36 }, (_, index) => <i key={index} className={index % 3 === 0 || index % 7 === 0 ? "on" : ""} />)}</div><strong>{active ? "Ready for student scans" : "Session ended"}</strong><span>{active ? "Expires in 08:42 · one check-in per student" : "Start a new session to accept check-ins."}</span></div></div>
        <aside className="panel live-panel"><p className="eyebrow">LIVE CHECK-IN</p><div className="live-count"><strong>32</strong><span>/ 58 enrolled</span></div><span className={`session-status ${active ? "active" : "closed"}`}>{active ? "Session active" : "Session closed"}</span><div className="latest"><span>Latest check-in</span><strong>Arun · 23CSE001</strong><small>10:07:18 AM</small></div><ul><li>Authenticated account required</li><li>Class and section are validated</li><li>QR identifies the session, not the student</li></ul></aside>
      </section>
    </>
  );
}

function Confirm({ title, detail, onCancel, onConfirm, confirmLabel = "Confirm" }: { title: string; detail: string; onCancel: () => void; onConfirm: () => void; confirmLabel?: string }) {
  return <div className="modal-backdrop" role="presentation"><div className="confirm-modal" role="dialog" aria-modal="true"><p className="eyebrow">CONFIRMATION</p><h2>{title}</h2><p>{detail}</p><div className="modal-actions"><Button onClick={onCancel}>Cancel</Button><Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button></div></div></div>;
}

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>("dashboard");
  const [academicData, setAcademicData] = useState<AcademicData>(() => loadAcademicData());
  const [selectedClassId, setSelectedClassId] = useState("CSE-A");
  const [attendanceStudents, setAttendanceStudents] = useState<AttendanceStudent[]>(() => {
    const data = loadAcademicData();
    return loadAttendance("CSE-A", getClassStudents(data, "CSE-A"));
  });

  const changeClass = (classId: string) => {
    setSelectedClassId(classId);
    setAttendanceStudents(loadAttendance(classId, getClassStudents(academicData, classId)));
  };

  const refreshAttendance = (classId: string, dataOverride?: AcademicData) => {
    if (classId !== selectedClassId) return;
    const source = dataOverride ?? academicData;
    setAttendanceStudents(loadAttendance(classId, getClassStudents(source, classId)));
  };

  const updateAcademicData = (data: AcademicData) => {
    setAcademicData(data);
    saveAcademicData(data);
  };

  return (
    <Shell workspace={workspace} setWorkspace={setWorkspace}>
      {workspace === "dashboard" ? <Dashboard setWorkspace={setWorkspace} /> : null}
      {workspace === "attendance" ? (
        <Attendance
          students={attendanceStudents}
          setStudents={setAttendanceStudents}
          setWorkspace={setWorkspace}
          classes={academicData.classes}
          classId={selectedClassId}
          onClassChange={changeClass}
        />
      ) : null}
      {workspace === "students" ? (
        <Students
          data={academicData}
          setData={updateAcademicData}
          selectedClassId={selectedClassId}
          setSelectedClassId={changeClass}
          refreshAttendance={refreshAttendance}
        />
      ) : null}
      {workspace === "spreadsheets" ? <Spreadsheets students={attendanceStudents} /> : null}
      {workspace === "messaging" ? <Messaging /> : null}
      {workspace === "reports" ? <Reports students={attendanceStudents} /> : null}
      {workspace === "qr" ? <QRSession /> : null}
      {workspace === "enroll" ? <EnrollmentQR classId={selectedClassId} classes={academicData.classes} setWorkspace={setWorkspace} /> : null}
    </Shell>
  );
}
