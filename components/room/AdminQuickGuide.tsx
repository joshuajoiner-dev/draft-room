const guideSteps = [
  { label: "Import Players", mark: "Roster" },
  { label: "Create Teams", mark: "Teams" },
  { label: "Invite Players", mark: "Link" },
  { label: "Begin Activity", mark: "Start" }
];

export function AdminQuickGuide() {
  return (
    <section className="admin-quick-guide" aria-label="Admin quick start guide">
      <p className="admin-panel-label">Quick Start</p>
      <div className="quick-start-grid">
        {guideSteps.map((step) => (
          <div className="quick-start-card" key={step.label}>
            <span aria-hidden="true">{step.mark}</span>
            <strong>{step.label}</strong>
          </div>
        ))}
      </div>
      <p className="quick-start-upgrade">
        Complete tools → <a href="https://joindraftroom.com">JoinDraftRoom.com</a>
      </p>
    </section>
  );
}
