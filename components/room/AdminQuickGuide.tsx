const guideSteps = ["Players Join", "Choose Your Format", "Click Generate"];

export function AdminQuickGuide() {
  return (
    <section className="admin-quick-guide" aria-label="Admin quick start guide">
      <p className="admin-panel-label">Quick Start</p>
      <ol>
        {guideSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
        <li>
          <a href="https://joindraftroom.com">Unlock Code → JoinDraftRoom.com</a>
        </li>
      </ol>
    </section>
  );
}
