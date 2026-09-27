import { useMemo, useState, type ReactNode } from "react";
import { getAttendancePercentage, getAttendanceSummary, loadAttendance, saveAttendance, type AttendanceStudent } from "./data/attendance";

type Workspace = "dashboard" | "attendance" | "spreadsheets" | "messaging" | "reports" | "qr";

const navItems: Array<{ id: Workspace; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "attendance", label: "Attendance" },
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

function Icon({ name }: { name: "arrow" | "plus" | "search" | "download" | "send" | "qr" | "sheet" }) {
  const paths: Record<string, ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    download: <><path d="M12 4v11M8 11l4 4 4-4" /><path d="M5 20h14" /></>,
    send: <><path d="m4 5 16 7-16 7 3-7-3-7Z" /><path d="M7 12h13" /></>,
    qr: <><path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5z" /><path d="M14 14h3v3h-3zM18 18h1v1h-1z" /></>,
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
}: {
  students: AttendanceStudent[];
  setStudents: (students: AttendanceStudent[]) => void;
  setWorkspace: (workspace: Workspace) => void;
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
    saveAttendance(draft);
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
        <select aria-label="Class"><option>CSE-A</option><option>CSE-B</option></select>
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
            <div><p className="eyebrow">TODAY'S RECORD</p><h2>CSE-A · Data Structures</h2></div>
            <span className="pill">Local draft</span>
          </div>
          <div className="table-tools">
            <Button variant={filter === "all" ? "primary" : "secondary"} onClick={() => setFilter("all")}>All students</Button>
            <Button variant={filter === "low" ? "primary" : "secondary"} onClick={() => setFilter("low")}>Below 75%</Button>
          </div>
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
          <div className="data-note">This first functional slice stores attendance locally in this APEX installation. It is not yet connected to a shared database.</div>
        </div>
        <aside className="panel action-panel">
          <p className="eyebrow">ATTENDANCE ACTIONS</p>
          <Button variant="primary" onClick={() => setEditorOpen(true)}>Mark attendance</Button>
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
  const [attendanceStudents, setAttendanceStudents] = useState<AttendanceStudent[]>(() => loadAttendance());

  return (
    <Shell workspace={workspace} setWorkspace={setWorkspace}>
      {workspace === "dashboard" ? <Dashboard setWorkspace={setWorkspace} /> : null}
      {workspace === "attendance" ? <Attendance students={attendanceStudents} setStudents={setAttendanceStudents} setWorkspace={setWorkspace} /> : null}
      {workspace === "spreadsheets" ? <Spreadsheets students={attendanceStudents} /> : null}
      {workspace === "messaging" ? <Messaging /> : null}
      {workspace === "reports" ? <Reports students={attendanceStudents} /> : null}
      {workspace === "qr" ? <QRSession /> : null}
    </Shell>
  );
}
