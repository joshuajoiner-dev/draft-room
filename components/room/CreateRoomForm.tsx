"use client";

import { useFormStatus } from "react-dom";
import { createRoom } from "@/lib/room/actions";

type CreateRoomFormProps = {
  error?: string;
};

function CreateRoomButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Creating Teams…" : "Create Teams"}
    </button>
  );
}

export function CreateRoomForm({ error }: CreateRoomFormProps) {
  return (
    <form action={createRoom} className="card form">
      <div className="stack-tight">
        <h1 className="page-title">Create Teams</h1>
        <p className="muted">
          Name the room.
          <br />
          Players can join from the link or QR code next.
        </p>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <label className="label">
        Room name
        <input className="input" name="name" placeholder="Friday camp teams" required maxLength={80} />
      </label>

      <CreateRoomButton />
    </form>
  );
}
