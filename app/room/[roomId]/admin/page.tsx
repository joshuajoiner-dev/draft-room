import Link from "next/link";
import { headers } from "next/headers";
import { AppFrame } from "@/components/layout/AppFrame";
import { DemoPresentation } from "@/components/presentation/DemoPresentation";
import { AdminQuickGuide } from "@/components/room/AdminQuickGuide";
import { BalancedRandomForm } from "@/components/room/BalancedRandomForm";
import { CaptainDraftSetupForm } from "@/components/room/CaptainDraftSetupForm";
import { CaptainDraftSummary } from "@/components/room/CaptainDraftSummary";
import { FeatureGatedModes } from "@/components/room/FeatureGatedModes";
import { GeneratedTeams } from "@/components/room/GeneratedTeams";
import { ManualAdminTimer } from "@/components/room/ManualAdminTimer";
import { PlayerNameForm } from "@/components/room/PlayerNameForm";
import { QRCodePanel } from "@/components/room/QRCodePanel";
import { RandomTeamsForm } from "@/components/room/RandomTeamsForm";
import { RoomHeader } from "@/components/room/RoomHeader";
import { RoomPlayerList } from "@/components/room/RoomPlayerList";
import { getRoomState } from "@/lib/room/queries";

type AdminPageProps = {
  params: {
    roomId: string;
  };
  searchParams: {
    error?: string;
    imported?: string;
    duplicates?: string;
    teams?: string;
    balancedTeams?: string;
    captainTeams?: string;
    assigned?: string;
  };
};

function getOrigin() {
  const requestHeaders = headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  return `${protocol}://${host}`;
}

const upgradeCheckoutUrl = process.env.NEXT_PUBLIC_UPGRADE_CHECKOUT_URL ?? "#complete-unlock";

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const { room, players, teams, assignments } = await getRoomState(params.roomId);
  const joinUrl = `${getOrigin()}/room/${room.id}/join`;
  const importedCount = Number(searchParams.imported ?? Number.NaN);
  const duplicateCount = Number(searchParams.duplicates ?? Number.NaN);
  const generatedTeamCount = Number(searchParams.teams ?? Number.NaN);
  const balancedTeamCount = Number(searchParams.balancedTeams ?? Number.NaN);
  const captainTeamCount = Number(searchParams.captainTeams ?? Number.NaN);
  const assignedPlayerCount = Number(searchParams.assigned ?? Number.NaN);
  const importMessage =
    Number.isFinite(importedCount) && Number.isFinite(duplicateCount)
      ? `Imported ${importedCount} players. ${duplicateCount} duplicates skipped.`
      : undefined;
  const randomTeamsMessage =
    Number.isFinite(generatedTeamCount) && Number.isFinite(assignedPlayerCount)
      ? `Generated ${generatedTeamCount} teams with ${assignedPlayerCount} players.`
      : undefined;
  const balancedRandomMessage =
    Number.isFinite(balancedTeamCount) && Number.isFinite(assignedPlayerCount)
      ? `Generated ${balancedTeamCount} balanced teams with ${assignedPlayerCount} players.`
      : undefined;
  const captainDraftMessage = Number.isFinite(captainTeamCount)
    ? `Set up ${captainTeamCount} captain teams.`
    : undefined;
  const isCaptainDraft = room.team_creation_mode === "captain_draft";

  return (
    <AppFrame variant="wide">
      <div className="stack">
        <div className="admin-top-grid">
          <RoomHeader room={room} />

          <aside className="admin-helper-panel" aria-label="Admin organizer tools">
            <AdminQuickGuide />
            <ManualAdminTimer />
          </aside>
        </div>

        <DemoPresentation placement="leaderboard" />

        <QRCodePanel joinUrl={joinUrl} upgradeHref={upgradeCheckoutUrl} />

        <RoomPlayerList roomId={room.id} players={players} />

        <PlayerNameForm roomId={room.id} createdByAdmin error={searchParams.error} message={importMessage} />

        <BalancedRandomForm
          roomId={room.id}
          playerCount={players.length}
          hasTeams={teams.length > 0}
          message={balancedRandomMessage}
        />

        <FeatureGatedModes
          quickRandom={
            <RandomTeamsForm
              roomId={room.id}
              playerCount={players.length}
              hasTeams={teams.length > 0}
              message={randomTeamsMessage}
            />
          }
          captainDraft={
            <CaptainDraftSetupForm
              roomId={room.id}
              players={players}
              hasCaptainTeams={isCaptainDraft && teams.length > 0}
              message={captainDraftMessage}
            />
          }
        />

        {isCaptainDraft ? (
          <CaptainDraftSummary roomId={room.id} teams={teams} players={players} />
        ) : (
          <GeneratedTeams
            roomId={room.id}
            roomName={room.name}
            roomCode={room.join_code}
            roomStatus={room.status}
            teams={teams}
            assignments={assignments}
            players={players}
          />
        )}

        <Link className="button button-secondary" href={`/room/${room.id}`}>
          View Room
        </Link>

        <DemoPresentation placement="footer" />
      </div>
    </AppFrame>
  );
}
