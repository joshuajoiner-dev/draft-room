import Link from "next/link";
import { headers } from "next/headers";
import { AnalyticsSuccessEvents } from "@/components/analytics/AnalyticsSuccessEvents";
import { AppFrame } from "@/components/layout/AppFrame";
import { LaunchPartnerPlacement } from "@/components/presentation/LaunchPartnerPlacement";
import { LaunchPartnerPresentedBy } from "@/components/presentation/LaunchPartnerPresentedBy";
import { BalancedRandomForm } from "@/components/room/BalancedRandomForm";
import { CaptainDraftSetupForm } from "@/components/room/CaptainDraftSetupForm";
import { CaptainDraftSummary } from "@/components/room/CaptainDraftSummary";
import { EventScoreboard } from "@/components/room/EventScoreboard";
import { FeatureGatedModes } from "@/components/room/FeatureGatedModes";
import { GeneratedTeams } from "@/components/room/GeneratedTeams";
import { LiveEventPanel } from "@/components/room/LiveEventPanel";
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
    ae?: string;
    error?: string;
    imported?: string;
    duplicates?: string;
    teams?: string;
    balancedTeams?: string;
    captainTeams?: string;
    captainsRandomized?: string;
    assigned?: string;
    created?: string;
  };
};

function getOrigin() {
  const requestHeaders = headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  return `${protocol}://${host}`;
}

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
  const launchPartnerContext = {
    roomId: room.id,
    playerCount: players.length,
    teamCount: teams.length
  };

  return (
    <AppFrame variant="wide">
      <AnalyticsSuccessEvents
        context={{
          page: "admin",
          roomId: room.id,
          playerCount: players.length,
          teamCount: teams.length,
          roomMode: room.team_creation_mode,
          roomNamePresent: Boolean(room.name.trim()),
          roomCodePresent: Boolean(room.join_code.trim())
        }}
      />
      <div className="stack">
        <div className="event-control-layout">
          <aside className="event-control-column event-control-left" aria-label="Room command rail">
            <RoomHeader room={room} />

            <EventScoreboard room={room} playerCount={players.length} teamCount={teams.length} />

            <LaunchPartnerPlacement
              {...launchPartnerContext}
              placement="admin_left_below_overview"
              variant="square"
              visibilityClass="launch-partner-visibility--desktop-column"
            />
          </aside>

          <main className="event-control-column event-control-center" aria-label="Primary event controls">
            <LiveEventPanel room={room} playerCount={players.length} teamCount={teams.length} />
            <QRCodePanel joinUrl={joinUrl} roomCode={room.join_code} />
            <LaunchPartnerPresentedBy {...launchPartnerContext} />
            <RoomPlayerList
              roomId={room.id}
              players={players}
              teamCount={teams.length}
              waitingPartner={
                <LaunchPartnerPlacement
                  {...launchPartnerContext}
                  placement="admin_waiting_players"
                  variant="compact"
                  visibilityClass="launch-partner-visibility--waiting-desktop"
                />
              }
            />
            <PlayerNameForm roomId={room.id} createdByAdmin error={searchParams.error} message={importMessage} />
            <BalancedRandomForm
              roomId={room.id}
              playerCount={players.length}
              hasTeams={teams.length > 0}
              message={balancedRandomMessage}
            />
          </main>

          <aside className="event-control-column event-control-right" aria-label="Complete tools and event timer">
            <ManualAdminTimer />
            <div className="complete-features-stack">
              <p className="admin-panel-label">Complete Features</p>
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
            </div>

            <LaunchPartnerPlacement
              {...launchPartnerContext}
              placement="admin_right_below_founder"
              variant="compact"
              visibilityClass="launch-partner-visibility--desktop-column"
            />
          </aside>
        </div>

        {isCaptainDraft ? (
          <CaptainDraftSummary roomId={room.id} teams={teams} players={players} />
        ) : (
          <GeneratedTeams
            roomId={room.id}
            roomName={room.name}
            roomCode={room.join_code}
            roomStatus={room.status}
            roomMode={room.team_creation_mode}
            teams={teams}
            assignments={assignments}
            players={players}
          />
        )}

        <div className="launch-partner-lower-band">
          <LaunchPartnerPlacement
            {...launchPartnerContext}
            placement="admin_footer_ribbon"
            variant="ribbon"
            visibilityClass="launch-partner-visibility--footer-ribbon"
          />
          <LaunchPartnerPlacement
            {...launchPartnerContext}
            placement="admin_launch_partner_open"
            variant="open"
            visibilityClass="launch-partner-visibility--open-slot"
          />
        </div>

        <Link className="button button-secondary" href={`/room/${room.id}`}>
          View Teams
        </Link>
      </div>
    </AppFrame>
  );
}
