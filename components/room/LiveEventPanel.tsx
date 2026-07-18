import type { ReactNode } from "react";
import { VenuePresentation } from "@/components/presentation/VenuePresentation";
import type { Room } from "@/types/database";

type LiveEventPanelProps = {
  children?: ReactNode;
  playerCount: number;
  room: Room;
  teamCount: number;
};

const formatLabels: Record<NonNullable<Room["team_creation_mode"]>, string> = {
  balanced_random: "Balanced",
  captain_draft: "Captain Draft",
  random_teams: "Quick Random"
};

const statusLabels: Record<Room["status"], string> = {
  drafting: "Drafting",
  finalized: "Final",
  setup: "Open"
};

export function LiveEventPanel({ children, playerCount, room, teamCount }: LiveEventPanelProps) {
  return (
    <section className="live-event-panel" aria-label="Live event status">
      <VenuePresentation placement="leaderboard" />

      <div className="live-event-header">
        <p className="admin-panel-label">Live Event</p>
        <strong>{statusLabels[room.status]}</strong>
      </div>

      <dl className="live-event-grid">
        <div>
          <dt>Players</dt>
          <dd>{playerCount}</dd>
        </div>
        <div>
          <dt>Teams</dt>
          <dd>{teamCount}</dd>
        </div>
      </dl>

      {children ? <div className="live-event-timer">{children}</div> : null}
    </section>
  );
}
