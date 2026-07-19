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
      <div className="event-title" aria-label="Event name">
        {room.name}
      </div>

      <div className="room-header-code">
        <RoomCodeCopy code={room.join_code} />
      </div>

      {tools ? <div className="room-header-tools">{tools}</div> : null}
    </div>
  );
}
