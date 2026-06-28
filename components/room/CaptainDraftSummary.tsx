import { beginCaptainDraft } from "@/lib/room/actions";
import type { Player, Team } from "@/types/database";

type CaptainDraftSummaryProps = {
  roomId: string;
  teams: Team[];
  players: Player[];
};

export function CaptainDraftSummary({ roomId, teams, players }: CaptainDraftSummaryProps) {
  if (!teams.length) {
    return null;
  }

  const playersById = new Map(players.map((player) => [player.id, player]));
  const captainIds = new Set(teams.map((team) => team.captain_player_id).filter(Boolean) as string[]);
  const availablePlayers = players.filter((player) => !captainIds.has(player.id));

  return (
    <section className="card stack" data-testid="captain-draft-summary">
      <div className="stack-tight">
        <h2>Captain Draft Setup</h2>
        <p className="muted">Draft order follows the team order below.</p>
      </div>

      <div className="teams-grid">
        {teams.map((team) => {
          const captain = team.captain_player_id ? playersById.get(team.captain_player_id) : undefined;

          return (
            <article className="team-card" key={team.id}>
              <div className="team-card-header">
                <h3>{team.name}</h3>
                <span className="badge">#{team.draft_order}</span>
              </div>
              <p className="captain-label">Captain: {captain?.name ?? "Not set"}</p>
            </article>
          );
        })}
      </div>

      <div className="stack-tight">
        <h3>Available Players</h3>
        <p className="muted">{availablePlayers.length} players available for the captain draft.</p>
      </div>

      {availablePlayers.length ? (
        <ul className="player-list" data-testid="captain-available-players">
          {availablePlayers.map((player) => (
            <li className="player-row" key={player.id}>
              <span>{player.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No available players.</p>
      )}

      <form action={beginCaptainDraft.bind(null, roomId)}>
        <button className="button" data-testid="begin-captain-draft" type="submit">
          Begin Captain Draft
        </button>
      </form>
    </section>
  );
}
