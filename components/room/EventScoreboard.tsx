import type { Room } from "@/types/database";

type EventScoreboardProps = {
  room: Room;
  playerCount: number;
  teamCount: number;
};

const formatLabels = {
  balanced_random: "Balanced",
  captain_draft: "Captain Draft",
  random_teams: "Quick Random"
} as const;

const statusConfig: Record<Room["status"], { label: string; tone: "live" | "attention" | "success" }> = {
  setup: { label: "Open", tone: "attention" },
  drafting: { label: "Drafting", tone: "live" },
  finalized: { label: "Final", tone: "success" }
};

export function EventScoreboard({ room, playerCount, teamCount }: EventScoreboardProps) {
  const status = statusConfig[room.status];
  const format = room.team_creation_mode ? formatLabels[room.team_creation_mode] : "Not Set";

  return (
    <section className="card compact-panel event-scoreboard" aria-label="Event overview">
      <div className="event-scoreboard-top">
        <p className="admin-panel-label">Event Overview</p>
        <span className={`scoreboard-status-chip scoreboard-status-chip--${status.tone}`}>{status.label}</span>
      </div>

      <p className="event-scoreboard-name">{room.name}</p>

      <div className="scoreboard-chip-row">
        <div className="scoreboard-chip">
          <span className="scoreboard-chip-label">Format</span>
          <span className="scoreboard-chip-value">{format}</span>
        </div>
        <div className="scoreboard-chip">
          <span className="scoreboard-chip-label">Players</span>
          <span className="scoreboard-chip-value">{playerCount}</span>
        </div>
        <div className="scoreboard-chip">
          <span className="scoreboard-chip-label">Teams</span>
          <span className="scoreboard-chip-value">{teamCount}</span>
        </div>
      </div>
    </section>
  );
}
