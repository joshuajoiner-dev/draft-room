import type { ReactNode } from "react";
import { VenuePresentation } from "@/components/presentation/VenuePresentation";
import type { Room } from "@/types/database";

type LiveEventPanelProps = {
  children?: ReactNode;
  playerCount: number;
  room: Room;
  teamCount: number;
};

const statusLabels: Record<Room["status"], string> = {
  drafting: "Drafting",
  finalized: "Final",
  setup: "Open"
};

const statusTone: Record<Room["status"], "live" | "attention" | "success"> = {
  setup: "attention",
  drafting: "live",
  finalized: "success"
};

export function LiveEventPanel({ children, playerCount, room, teamCount }: LiveEventPanelProps) {
  const isLive = playerCount > 0 && room.status !== "finalized";

  return (
    <section
      className={`live-event-panel${isLive ? " live-event-panel--active" : ""}`}
      aria-label="Live event status"
    >
      <VenuePresentation
        context={{ playerCount, teamCount, surface: "admin" }}
        placement="leaderboard"
      />

      <div className="live-event-header">
        <div className="live-event-title-group">
          <p className="admin-panel-label">Live Event</p>
          {isLive ? (
            <span className="live-event-indicator">
              <span aria-hidden="true" className="live-event-dot" />
              Live
            </span>
          ) : null}
        </div>
        <strong className={`live-event-status live-event-status--${statusTone[room.status]}`}>
          {statusLabels[room.status]}
        </strong>
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
