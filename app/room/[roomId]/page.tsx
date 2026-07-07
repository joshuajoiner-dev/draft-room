import Link from "next/link";
import { headers } from "next/headers";
import { AppFrame } from "@/components/layout/AppFrame";
import { DemoPresentation } from "@/components/presentation/DemoPresentation";
import { QRCodePanel } from "@/components/room/QRCodePanel";
import { RoomHeader } from "@/components/room/RoomHeader";
import { RoomPlayerList } from "@/components/room/RoomPlayerList";
import { getRoomState } from "@/lib/room/queries";

type RoomPageProps = {
  params: {
    roomId: string;
  };
};

function getOrigin() {
  const requestHeaders = headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  return `${protocol}://${host}`;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { room, players } = await getRoomState(params.roomId);
  const joinUrl = `${getOrigin()}/room/${room.id}/join`;

  return (
    <AppFrame>
      <div className="stack">
        <RoomHeader room={room} />

        <DemoPresentation placement="leaderboard" />

        <QRCodePanel joinUrl={joinUrl} />

        <RoomPlayerList roomId={room.id} players={players} />

        <div className="page-grid">
          <Link className="button button-secondary" href={`/room/${room.id}/join`}>
            Join Room
          </Link>
          <Link className="button" href={`/room/${room.id}/admin`}>
            Admin
          </Link>
        </div>

        <DemoPresentation placement="footer" />
      </div>
    </AppFrame>
  );
}
