const guideSteps = [
  "Import Players",
  "Create Teams",
  "Invite Players",
  "Begin Activity"
];

export function AdminQuickGuide() {
  return (
    <section className="admin-quick-guide" aria-label="Admin quick start guide">
      <p className="admin-panel-label">Quick Start</p>
      <ol className="quick-start-list">
        {guideSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
