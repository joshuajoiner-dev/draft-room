const guideSteps = [
  { icon: "roster", label: "Import", mark: "Roster" },
  { icon: "teams", label: "Create", mark: "Teams" },
  { icon: "invite", label: "Invite", mark: "Link" },
  { icon: "start", label: "Play", mark: "Start" }
];

export function AdminQuickGuide() {
  return (
    <section className="admin-quick-guide" aria-label="Admin quick start guide">
      <p className="admin-panel-label">Quick Start</p>
      <div className="quick-start-grid">
        {guideSteps.map((step) => (
          <div className="quick-start-card" data-icon={step.icon} key={step.label}>
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
