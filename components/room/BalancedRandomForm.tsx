import { generateBalancedRandomTeams } from "@/lib/room/actions";

type BalancedRandomFormProps = {
  roomId: string;
  playerCount: number;
  hasTeams: boolean;
  message?: string;
};

export function BalancedRandomForm({ roomId, playerCount, hasTeams, message }: BalancedRandomFormProps) {
  const action = generateBalancedRandomTeams.bind(null, roomId);

  return (
    <form action={action} className="card form" data-testid="balanced-random-form">
      <div className="stack-tight">
        <h2>⚖️ Balanced Random</h2>
        <p className="muted">Randomly distribute all current players into even team sizes.</p>
      </div>

      {message ? <div className="success">{message}</div> : null}

      <label className="label">
        Balanced Random teams
        <input
          className="input"
          data-testid="balanced-random-team-count"
          name="teamCount"
          type="number"
          min={2}
          max={25}
          defaultValue={2}
          required
        />
      </label>

      <button
        aria-disabled={!playerCount}
        aria-label={!playerCount ? "Import players before generating balanced random teams" : undefined}
        className="button"
        data-testid="balanced-random-submit"
        type="submit"
        disabled={!playerCount}
      >
        {hasTeams ? "Regenerate Balanced Teams" : "Generate Balanced Teams"}
      </button>
    </form>
  );
}
