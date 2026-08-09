import type { Metadata } from "next";
import { AnalyticsSuccessEvents } from "@/components/analytics/AnalyticsSuccessEvents";
import { AppFrame } from "@/components/layout/AppFrame";
import { PlayerNameForm } from "@/components/room/PlayerNameForm";
import { RoomHeader } from "@/components/room/RoomHeader";
import { RoomPlayerList } from "@/components/room/RoomPlayerList";
import { normalizeRoomCode } from "@/lib/room/roomCode";
import { getRoomStateByJoinCode } from "@/lib/room/queries";

type PublicRoomPageProps = {
  params: {
    roomCode: string;
  };
  searchParams: {
    ae?: string;
    error?: string;
    joined?: string;
  };
};

export async function generateMetadata({ params }: PublicRoomPageProps): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: false
    },
    title: "Join Draft Room"
  };
}

export default async function PublicRoomPage({ params, searchParams }: PublicRoomPageProps) {
  const { room, players } = await getRoomStateByJoinCode(params.roomCode);
  const publicRoomCode = normalizeRoomCode(room.join_code);

  return (
    <AppFrame>
      <AnalyticsSuccessEvents
        context={{
          page: "short_room",
          roomCodePresent: Boolean(publicRoomCode)
        }}
      />
      <div className="stack">
        <RoomHeader room={room} />

        <div className="page-grid">
          <PlayerNameForm roomId={room.id} error={searchParams.error} />
          <RoomPlayerList roomId={room.id} players={players} />
        </div>
      </div>
    </AppFrame>
  );
}
