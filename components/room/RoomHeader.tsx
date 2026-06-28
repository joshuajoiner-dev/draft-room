import { RoomCodeCopy } from "@/components/room/RoomCodeCopy";
import type { Room } from "@/types/database";

type RoomHeaderProps = {
  room: Room;
};

export function RoomHeader({ room }: RoomHeaderProps) {
  return (
    <div className="room-header">
      <RoomCodeCopy code={room.join_code} />

      <div className="stack-tight">
        <h1 className="page-title">{room.name}</h1>
        <p className="body-copy">Share the room link or QR code so players can join.</p>
      </div>
    </div>
  );
}
