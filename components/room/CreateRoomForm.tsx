import { createRoom } from "@/lib/room/actions";

type CreateRoomFormProps = {
  error?: string;
};

export function CreateRoomForm({ error }: CreateRoomFormProps) {
  return (
    <form action={createRoom} className="card form">
      <div className="stack-tight">
        <h1 className="page-title">Create room</h1>
        <p className="muted">Name the room. Players can join from the link or QR code next.</p>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <label className="label">
        Room name
        <input className="input" name="name" placeholder="Friday camp teams" required maxLength={80} />
      </label>

      <button className="button" type="submit">
        Create Room
      </button>
    </form>
  );
}
