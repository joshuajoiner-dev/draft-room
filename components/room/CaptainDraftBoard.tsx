import { makeCaptainPick, reassignPlayer, unassignPlayer, undoLatestAssignment } from "@/lib/room/actions";
import { CountdownTimer } from "@/components/room/CountdownTimer";
import { PrintTeamsButton } from "@/components/room/PrintTeamsButton";
import type { CaptainPick, Player, RoomStatus, Team, TeamAssignment } from "@/types/database";

type CaptainDraftBoardProps = {
  roomId: string;
  roomName: string;
  roomCode: string;
  roomStatus: RoomStatus;
  teams: Team[];
  players: Player[];
  assignments: TeamAssignment[];
  captainPicks: CaptainPick[];
  error?: string;
};

export function CaptainDraftBoard({
  roomId,
  roomName,
  roomCode,
  roomStatus,
  teams,
  players,
  assignments,
  captainPicks,
  error
}: CaptainDraftBoardProps) {
  const playersById = new Map(players.map((player) => [player.id, player]));
  const assignmentsByTeamId = new Map<string, TeamAssignment[]>();
  const assignedPlayerIds = new Set(assignments.map((assignment) => assignment.player_id));
  const availablePlayers = players.filter((player) => !assignedPlayerIds.has(player.id));
  const isComplete = availablePlayers.length === 0;
  const canOverride = roomStatus !== "finalized";
  const pickCount = captainPicks.length;
  const captainCount = teams.length;
  const draftedPlayerCount = Math.max(0, assignments.length - captainCount);
  const totalDraftablePlayers = Math.max(0, players.length - captainCount);
  const progressPercent = totalDraftablePlayers ? Math.round((draftedPlayerCount / totalDraftablePlayers) * 100) : 100;
  const currentTeam = teams.length && !isComplete ? teams[pickCount % teams.length] : null;
  const currentCaptain = currentTeam?.captain_player_id ? playersById.get(currentTeam.captain_player_id) : null;
  const currentRound = currentTeam ? Math.floor(pickCount / teams.length) + 1 : null;

  for (const assignment of assignments) {
    const teamAssignments = assignmentsByTeamId.get(assignment.team_id) ?? [];
    teamAssignments.push(assignment);
    assignmentsByTeamId.set(assignment.team_id, teamAssignments);
  }

  return (
    <div className="stack print-scope">
      <section className="card stack print-hidden">
        <div className="stack-tight">
          <p className="badge">{isComplete ? "Complete" : `Round ${currentRound}`}</p>
          <h1 className="page-title">{isComplete ? "Final Teams" : currentTeam?.name}</h1>
          <p className="body-copy">
            {isComplete
              ? "All players have been assigned."
              : `${currentCaptain?.name ?? "Current captain"} is picking now.`}
          </p>
          <p className="muted draft-guidance">
            Pass this device to the active captain for each pick, or make selections yourself.
          </p>
        </div>

        <div className="draft-progress" aria-label={`${draftedPlayerCount} of ${totalDraftablePlayers} draft picks complete`}>
          <div className="draft-progress-header">
            <span>Draft progress</span>
            <strong>
              {draftedPlayerCount}/{totalDraftablePlayers}
            </strong>
          </div>
          <div className="draft-progress-track">
            <div className="draft-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {!isComplete ? <CountdownTimer /> : null}

        {isComplete ? (
          <div className="confetti-burst" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : null}

        {error ? <div className="error">{error}</div> : null}
      </section>

      <section className="card stack printable-teams" data-testid="draft-teams">
        <div className="print-only print-header">
          <p>Draft Room</p>
          <h1>{roomName}</h1>
          <strong>Room Code: {roomCode}</strong>
        </div>

        <div className="stack-tight">
          <h2>{isComplete ? "Final Teams" : "Teams"}</h2>
          <p className="muted">Draft order follows the team order.</p>
        </div>

        {isComplete ? (
          <PrintTeamsButton playerCount={players.length} roomMode="captain_draft" teamCount={teams.length} />
        ) : null}

        {canOverride ? (
          <form action={undoLatestAssignment.bind(null, roomId, "draft")} className="print-hidden">
            <button className="button button-secondary" type="submit">
              Undo Last Pick
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
            const captain = team.captain_player_id ? playersById.get(team.captain_player_id) : undefined;

            return (
              <article className="team-card" data-testid="draft-team-card" key={team.id}>
                <div className="team-card-header">
                  <h3>{team.name}</h3>
                  <span className="badge">#{team.draft_order}</span>
                </div>
                <p className="captain-label">Captain: {captain?.name ?? "Not set"}</p>
                <ul className="team-player-list">
                  {teamPlayers.map((player) => (
                    <li className="team-player-item" data-testid={`draft-team-player-${player.id}`} key={player.id}>
                      <span>{player.name}</span>

                      {canOverride ? (
                        <div className="override-controls">
                          <form action={reassignPlayer.bind(null, roomId, player.id, "draft")} className="override-move">
                            <label className="sr-only" htmlFor={`draft-move-${team.id}-${player.id}`}>
                              Move {player.name}
                            </label>
                            <select
                              className="input input-compact"
                              data-testid={`draft-move-player-${player.id}`}
                              defaultValue={team.id}
                              id={`draft-move-${team.id}-${player.id}`}
                              name="teamId"
                            >
                              {teams.map((targetTeam) => (
                                <option key={targetTeam.id} value={targetTeam.id}>
                                  {targetTeam.name}
                                </option>
                              ))}
                            </select>
                            <button className="button button-small button-secondary" data-testid={`draft-move-button-${player.id}`} type="submit">
                              Move
                            </button>
                          </form>

                          <form action={unassignPlayer.bind(null, roomId, player.id, "draft")}>
                            <button className="button button-small button-danger" data-testid={`draft-unassign-player-${player.id}`} type="submit">
                              Unassign
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {!isComplete ? (
        <section className="card stack" data-testid="draft-available-players">
          <div className="stack-tight">
            <h2>Available Players</h2>
            <p className="muted">{availablePlayers.length} players remaining.</p>
          </div>

          <div className="pick-list">
            {availablePlayers.map((player) => (
              <form action={makeCaptainPick.bind(null, roomId, player.id)} key={player.id}>
                <button className="pick-button" type="submit">
                  {player.name}
                </button>
              </form>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
