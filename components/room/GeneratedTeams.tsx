import { reassignPlayer, unassignPlayer, undoLatestAssignment } from "@/lib/room/actions";
import type { Player, RoomStatus, Team, TeamAssignment } from "@/types/database";

type GeneratedTeamsProps = {
  roomId: string;
  roomStatus: RoomStatus;
  teams: Team[];
  assignments: TeamAssignment[];
  players: Player[];
};

export function GeneratedTeams({ roomId, roomStatus, teams, assignments, players }: GeneratedTeamsProps) {
  if (!teams.length) {
    return null;
  }

  const canOverride = roomStatus !== "finalized";
  const playersById = new Map(players.map((player) => [player.id, player]));
  const assignmentsByTeamId = new Map<string, TeamAssignment[]>();

  for (const assignment of assignments) {
    const teamAssignments = assignmentsByTeamId.get(assignment.team_id) ?? [];
    teamAssignments.push(assignment);
    assignmentsByTeamId.set(assignment.team_id, teamAssignments);
  }

  return (
    <section className="card stack">
      <div className="stack-tight">
        <h2>Generated Teams</h2>
        <p className="muted">{teams.length} teams generated from the current room players.</p>
      </div>

      {canOverride ? (
        <form action={undoLatestAssignment.bind(null, roomId, "admin")}>
          <button className="button button-secondary" type="submit">
            Undo Last Assignment
          </button>
        </form>
      ) : (
        <p className="muted">Finalized teams are locked.</p>
      )}

      <div className="teams-grid">
        {teams.map((team) => {
          const teamPlayers = (assignmentsByTeamId.get(team.id) ?? [])
            .map((assignment) => playersById.get(assignment.player_id))
            .filter(Boolean) as Player[];

          return (
            <article className="team-card" key={team.id}>
              <div className="team-card-header">
                <h3>{team.name}</h3>
                <span className="badge">{teamPlayers.length}</span>
              </div>

              {teamPlayers.length ? (
                <ul className="team-player-list">
                  {teamPlayers.map((player) => (
                    <li className="team-player-item" data-testid={`team-player-${player.id}`} key={player.id}>
                      <span>{player.name}</span>

                      {canOverride ? (
                        <div className="override-controls">
                          <form action={reassignPlayer.bind(null, roomId, player.id, "admin")} className="override-move">
                            <label className="sr-only" htmlFor={`move-${team.id}-${player.id}`}>
                              Move {player.name}
                            </label>
                            <select
                              className="input input-compact"
                              data-testid={`move-player-${player.id}`}
                              defaultValue={team.id}
                              id={`move-${team.id}-${player.id}`}
                              name="teamId"
                            >
                              {teams.map((targetTeam) => (
                                <option key={targetTeam.id} value={targetTeam.id}>
                                  {targetTeam.name}
                                </option>
                              ))}
                            </select>
                            <button className="button button-small button-secondary" data-testid={`move-button-${player.id}`} type="submit">
                              Move
                            </button>
                          </form>

                          <form action={unassignPlayer.bind(null, roomId, player.id, "admin")}>
                            <button className="button button-small button-danger" data-testid={`unassign-player-${player.id}`} type="submit">
                              Unassign
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No players assigned.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
