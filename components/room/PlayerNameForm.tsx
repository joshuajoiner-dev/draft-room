import { addPlayerToRoom, importPlayersToRoom } from "@/lib/room/actions";

type PlayerNameFormProps = {
  roomId: string;
  createdByAdmin?: boolean;
  error?: string;
  message?: string;
};

export function PlayerNameForm({ roomId, createdByAdmin = false, error, message }: PlayerNameFormProps) {
  const action = createdByAdmin ? importPlayersToRoom.bind(null, roomId) : addPlayerToRoom.bind(null, roomId, false);
  const label = createdByAdmin ? "Add player" : "Join room";

  return (
    <form action={action} className="card form">
      <div className="stack-tight">
        <h2>{createdByAdmin ? "Import Players" : "Enter your name"}</h2>
        <p className="muted">
          {createdByAdmin
            ? "Paste names from a list or spreadsheet."
            : "Your name will appear in the room pool."}
        </p>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {message ? (
        <div className="toast" role="status">
          {message}
        </div>
      ) : null}

      {createdByAdmin ? (
        <label className="label">
          Import Players
          <textarea
            className="input textarea"
            data-testid="import-players-textarea"
            name="names"
            placeholder={"Avery\nBlake, Casey\nDana\tEmerson"}
            required
          />
        </label>
      ) : (
        <label className="label">
          Player name
          <input className="input" name="name" placeholder="Name" required maxLength={80} />
        </label>
      )}

      <button className="button" type="submit">
        {createdByAdmin ? "Add Players" : label}
      </button>
    </form>
  );
}
