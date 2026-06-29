import { AppFrame } from "@/components/layout/AppFrame";
import { CaptainDraftBoard } from "@/components/room/CaptainDraftBoard";
import { getCaptainDraftState } from "@/lib/room/queries";

type CaptainDraftPageProps = {
  params: {
    roomId: string;
  };
  searchParams: {
    error?: string;
  };
};

export default async function CaptainDraftPage({ params, searchParams }: CaptainDraftPageProps) {
  const { room, players, teams, assignments, captainPicks } = await getCaptainDraftState(params.roomId);

  return (
    <AppFrame>
      <div className="stack">
        <div className="stack-tight">
          <p className="badge">{room.status}</p>
          <h1 className="page-title">{room.name}</h1>
        </div>

        <CaptainDraftBoard
          roomId={room.id}
          roomName={room.name}
          roomCode={room.join_code}
          roomStatus={room.status}
          teams={teams}
          players={players}
          assignments={assignments}
          captainPicks={captainPicks}
          error={searchParams.error}
        />
      </div>
    </AppFrame>
  );
}
