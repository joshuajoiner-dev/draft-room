import { redirect } from "next/navigation";
import { buildPublicRoomPath } from "@/lib/room/publicRoomUrl";
import { normalizeRoomCode } from "@/lib/room/roomCode";
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
  const { room } = await getRoomState(params.roomId);
  const destination = buildPublicRoomPath(normalizeRoomCode(room.join_code));
  const query = searchParams.error ? `?error=${encodeURIComponent(searchParams.error)}` : "";

  redirect(`${destination}${query}`);
}
