"use client";

import { useState } from "react";
import { randomizeCaptains, setupCaptainDraft } from "@/lib/room/actions";
import type { Player } from "@/types/database";

type CaptainDraftSetupFormProps = {
  roomId: string;
  players: Player[];
  hasCaptainTeams: boolean;
  message?: string;
};

export function CaptainDraftSetupForm({ roomId, players, hasCaptainTeams, message }: CaptainDraftSetupFormProps) {
  const [teamCount, setTeamCount] = useState(2);
  const setupAction = setupCaptainDraft.bind(null, roomId);
  const randomizeAction = randomizeCaptains.bind(null, roomId);
  const captainSlots = Array.from({ length: teamCount }, (_, index) => index);
  const disabled = players.length < teamCount;

  return (
    <section className="card stack" data-testid="captain-draft-setup">
      <div className="stack-tight">
        <h2>👥 Captain Draft</h2>
        <p className="muted">Choose one captain per team. Captains start on their own teams.</p>
      </div>

      {message ? <div className="success">{message}</div> : null}

      <label className="label">
        Captain teams
        <input
          className="input"
          data-testid="captain-team-count"
          min={2}
          max={Math.min(25, Math.max(2, players.length))}
          name="teamCount"
          onChange={(event) => setTeamCount(Number(event.target.value))}
          required
          type="number"
          value={teamCount}
        />
      </label>

      <form action={setupAction} className="form">
        <input name="teamCount" type="hidden" value={teamCount} />

        {captainSlots.map((index) => (
          <label className="label" key={index}>
            Team {index + 1} captain
            <select className="input" data-testid={`captain-select-${index}`} name={`captainId-${index}`} required>
              <option value="">Choose captain</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
        ))}

        <button
          aria-disabled={disabled}
          aria-label={disabled ? "Import at least one player per captain team before saving" : undefined}
          className="button"
          data-testid="save-captain-teams"
          disabled={disabled}
          type="submit"
        >
          {hasCaptainTeams ? "Update Captain Teams" : "Save Captain Teams"}
        </button>
      </form>

      <form action={randomizeAction}>
        <input name="teamCount" type="hidden" value={teamCount} />
        <button
          aria-disabled={disabled}
          aria-label={disabled ? "Import at least one player per captain team before randomizing" : undefined}
          className="button button-secondary"
          data-testid="randomize-captains"
          disabled={disabled}
          type="submit"
        >
          Randomize Captains
        </button>
      </form>
    </section>
  );
}
