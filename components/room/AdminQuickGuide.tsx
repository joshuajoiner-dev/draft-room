const guideSteps = ["Players Join | Import Players", "Choose Your Format", "Click Generate"];

export function AdminQuickGuide() {
  return (
    <section className="admin-quick-guide" aria-label="Admin quick start guide">
      <p className="admin-panel-label">Quick Start</p>
      <ol>
        {guideSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
        <li>
          Unlock More → <a href="https://joindraftroom.com">JoinDraftRoom.com</a>
        </li>
      </ol>
    </section>
  );
}
