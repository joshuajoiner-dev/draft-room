import Link from "next/link";
import { AnalyticsSuccessEvents } from "@/components/analytics/AnalyticsSuccessEvents";
import { AppFrame } from "@/components/layout/AppFrame";
import { QRCodePanel } from "@/components/room/QRCodePanel";
import { RoomHeader } from "@/components/room/RoomHeader";
import { RoomPlayerList } from "@/components/room/RoomPlayerList";
import { buildPublicRoomPath, buildPublicRoomUrl } from "@/lib/room/publicRoomUrl";
import { getRequestOrigin } from "@/lib/room/requestOrigin";
import { normalizeRoomCode } from "@/lib/room/roomCode";
import { getRoomState } from "@/lib/room/queries";

type RoomPageProps = {
  params: {
    roomId: string;
  };
  searchParams: {
    ae?: string;
    joined?: string;
  };
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { room, players } = await getRoomState(params.roomId);
  const publicRoomCode = normalizeRoomCode(room.join_code);
  const joinUrl = buildPublicRoomUrl(getRequestOrigin(), publicRoomCode);
  const publicRoomPath = buildPublicRoomPath(publicRoomCode);

  return (
    <AppFrame>
      <AnalyticsSuccessEvents
        context={{
          page: "room",
          roomId: room.id,
          roomCodePresent: Boolean(room.join_code.trim())
        }}
      />
      <div className="stack">
        <RoomHeader room={room} />

        <QRCodePanel joinUrl={joinUrl} roomCode={room.join_code} />

        <RoomPlayerList roomId={room.id} players={players} />

        <div className="page-grid">
          <Link className="button button-secondary" href={publicRoomPath}>
            Join Room
          </Link>
          <Link className="button" href={`/room/${room.id}/admin`}>
            Admin
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
