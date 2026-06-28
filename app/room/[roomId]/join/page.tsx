import Link from "next/link";
import { AppFrame } from "@/components/layout/AppFrame";
import { PlayerNameForm } from "@/components/room/PlayerNameForm";
import { RoomHeader } from "@/components/room/RoomHeader";
import { RoomPlayerList } from "@/components/room/RoomPlayerList";
import { getRoomState } from "@/lib/room/queries";

type JoinPageProps = {
  params: {
    roomId: string;
  };
  searchParams: {
    error?: string;
  };
};

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { room, players } = await getRoomState(params.roomId);

  return (
    <AppFrame>
      <div className="stack">
        <RoomHeader room={room} />

        <div className="page-grid">
          <PlayerNameForm roomId={room.id} error={searchParams.error} />
          <RoomPlayerList roomId={room.id} players={players} />
        </div>

        <Link className="button button-secondary" href={`/room/${room.id}`}>
          Back to Room
        </Link>
      </div>
    </AppFrame>
  );
}
