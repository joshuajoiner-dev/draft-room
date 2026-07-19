"use client";

export function PrintTeamsButton() {
  return (
    <button className="button button-output print-hidden" type="button" onClick={() => window.print()}>
      Print Teams
    </button>
  );
}
