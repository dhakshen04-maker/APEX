const workflows = [
  { title: "Attendance", detail: "Take attendance, start QR sessions, and review percentages." },
  { title: "Spreadsheets", detail: "Inspect attendance sheets and prepare safe updates." },
  { title: "Messaging", detail: "Draft reminders and announcements with review before send." },
  { title: "Reports", detail: "Generate clear reports from validated attendance data." },
];

export default function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="orb" aria-hidden="true"><span /><span /></div>
          <div>
            <strong>APEX</strong>
            <small>Teacher workspace</small>
          </div>
        </div>
        <nav aria-label="Primary">
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#attendance">Attendance</a>
          <a href="#spreadsheets">Spreadsheets</a>
          <a href="#messaging">Messaging</a>
          <a href="#reports">Reports</a>
        </nav>
        <div className="profile">Teacher · CSE-A</div>
      </header>

      <section className="hero" id="dashboard">
        <div>
          <p className="eyebrow">TEACHER WORK ASSISTANT</p>
          <h1>Good evening. What should APEX handle?</h1>
          <p className="subtitle">Attendance, spreadsheets, messaging, and reports in one focused workspace.</p>
        </div>
        <button className="assistant-button" type="button">Open APEX Assistant</button>
      </section>

      <section className="grid" aria-label="APEX workflows">
        {workflows.map((workflow) => (
          <article className="card" key={workflow.title}>
            <div className="card-dot" />
            <h2>{workflow.title}</h2>
            <p>{workflow.detail}</p>
            <button type="button">Open workspace</button>
          </article>
        ))}
      </section>

      <section className="safety">
        <div>
          <p className="eyebrow">APEX SAFETY</p>
          <h2>Review before APEX changes data or sends messages.</h2>
          <p>Actions that modify records or communicate externally will use a confirmation step.</p>
        </div>
        <span>Ready</span>
      </section>
    </main>
  );
}
