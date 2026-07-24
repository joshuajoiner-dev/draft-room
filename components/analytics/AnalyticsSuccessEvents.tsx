"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeRoomMode, readFiniteNumber, trackEventOnce } from "@/lib/analytics";

type AdminAnalyticsContext = {
  page: "admin";
  roomId: string;
  playerCount: number;
  teamCount: number;
  roomMode: string | null;
  roomNamePresent: boolean;
  roomCodePresent: boolean;
};

type RoomAnalyticsContext = {
  page: "room";
  roomId: string;
  roomCodePresent: boolean;
};

type AnalyticsSuccessEventsProps = {
  context: AdminAnalyticsContext | RoomAnalyticsContext;
};

function AnalyticsSuccessEventsInner({ context }: AnalyticsSuccessEventsProps) {
  const searchParams = useSearchParams();
  const processedAe = useRef<string | null>(null);

  useEffect(() => {
    const ae = searchParams.get("ae");

    if (!ae || processedAe.current === ae) {
      return;
    }

    processedAe.current = ae;

    if (context.page === "admin") {
      if (searchParams.get("created") === "1") {
        trackEventOnce(`create_room:${ae}`, "create_room", {
          room_mode: normalizeRoomMode(context.roomMode),
          room_name_present: context.roomNamePresent,
          player_count: context.playerCount,
          team_count: context.teamCount,
          source_page: "room_new"
        });
        return;
      }

      const quickRandomTeams = searchParams.get("teams");

      if (quickRandomTeams) {
        trackEventOnce(`generate_quick_random:${ae}`, "generate_quick_random", {
          player_count: readFiniteNumber(searchParams.get("assigned"), context.playerCount),
          team_count: readFiniteNumber(quickRandomTeams, context.teamCount)
        });
        return;
      }

      const balancedTeams = searchParams.get("balancedTeams");

      if (balancedTeams) {
        trackEventOnce(`generate_balanced_teams:${ae}`, "generate_balanced_teams", {
          player_count: readFiniteNumber(searchParams.get("assigned"), context.playerCount),
          team_count: readFiniteNumber(balancedTeams, context.teamCount),
          balancing_method: "balanced_random"
        });
        return;
      }

      const captainTeams = searchParams.get("captainTeams");

      if (captainTeams) {
        trackEventOnce(`generate_captain_draft:${ae}`, "generate_captain_draft", {
          player_count: context.playerCount,
          captain_count: readFiniteNumber(captainTeams, context.teamCount),
          captains_randomized: searchParams.get("captainsRandomized") === "1"
        });
      }

      return;
    }

    if (context.page === "room" && searchParams.get("joined") === "1") {
      trackEventOnce(`join_room:${ae}`, "join_room", {
        join_method: "name_form",
        room_code_present: context.roomCodePresent
      });
    }
  }, [context, searchParams]);

  return null;
}

export function AnalyticsSuccessEvents(props: AnalyticsSuccessEventsProps) {
  return (
    <Suspense fallback={null}>
      <AnalyticsSuccessEventsInner {...props} />
    </Suspense>
  );
}
