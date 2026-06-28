import { generateRandomTeams } from "@/lib/room/actions";

type RandomTeamsFormProps = {
  roomId: string;
  playerCount: number;
  hasTeams: boolean;
  message?: string;
};

export function RandomTeamsForm({ roomId, playerCount, hasTeams, message }: RandomTeamsFormProps) {
  const action = generateRandomTeams.bind(null, roomId);

  return (
    <form action={action} className="card form">
      <div className="stack-tight">
        <h2>⚡ Quick Random</h2>
        <p className="muted">Choose a team count and randomly assign all current players.</p>
      </div>

      {message ? <div className="success">{message}</div> : null}

      <label className="label">
        Number of teams
        <input className="input" name="teamCount" type="number" min={2} max={25} defaultValue={2} required />
      </label>

      <button
        aria-disabled={!playerCount}
        aria-label={!playerCount ? "Import players before generating random teams" : undefined}
        className="button"
        type="submit"
        disabled={!playerCount}
      >
        {hasTeams ? "Regenerate Teams" : "Generate Teams"}
      </button>
    </form>
  );
}
