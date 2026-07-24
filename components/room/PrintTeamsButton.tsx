"use client";

import { normalizeRoomMode, trackEvent } from "@/lib/analytics";

type PrintTeamsButtonProps = {
  playerCount: number;
  teamCount: number;
  roomMode: string | null;
};

export function PrintTeamsButton({ playerCount, teamCount, roomMode }: PrintTeamsButtonProps) {
  function handlePrint() {
    trackEvent("print_teams", {
      player_count: playerCount,
      team_count: teamCount,
      room_mode: normalizeRoomMode(roomMode)
    });
    window.print();
  }

  return (
    <button className="button button-output print-hidden" type="button" onClick={handlePrint}>
      Print Teams
    </button>
  );
}
