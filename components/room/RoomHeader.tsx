import type { ReactNode } from "react";
import { RoomCodeCopy } from "@/components/room/RoomCodeCopy";
import type { Room } from "@/types/database";

type RoomHeaderProps = {
  room: Room;
  tools?: ReactNode;
};

export function RoomHeader({ room, tools }: RoomHeaderProps) {
  return (
    <div className={tools ? "room-header room-header-admin" : "room-header"}>
      <div className="room-header-code">
        <RoomCodeCopy code={room.join_code} />
      </div>

      <div className="stack-tight room-header-info">
        <h1 className="page-title">{room.name}</h1>
        <p className="body-copy">Share the room link or QR code so players can join.</p>
      </div>

      {tools ? <div className="room-header-tools">{tools}</div> : null}
    </div>
  );
}
