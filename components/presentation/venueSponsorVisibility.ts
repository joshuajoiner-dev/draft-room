import { ENABLE_VENUE_SPONSORS, venueSponsors, type VenueSponsorPlacement } from "@/components/presentation/venueSponsors";

export type VenueArenaContext = {
  playerCount: number;
  teamCount: number;
  surface?: "admin" | "room" | "print";
};

/**
 * Controls when each sponsor placement appears so inventory rotates with the event
 * instead of stacking on a single screen.
 */
export function isVenueSponsorVisible(placement: VenueSponsorPlacement, context: VenueArenaContext) {
  if (!ENABLE_VENUE_SPONSORS || !venueSponsors[placement]) {
    return false;
  }

  const { playerCount, teamCount, surface = "admin" } = context;

  switch (placement) {
    case "waiting_screen":
      return playerCount === 0;
    case "leaderboard":
      return playerCount > 0 && teamCount === 0;
    case "below_qr":
      return true;
    case "timer_panel":
      return playerCount > 0 && teamCount === 0;
    case "footer":
      return teamCount > 0 && surface === "admin";
    case "printable_roster_footer":
      return teamCount > 0 && surface === "print";
    default:
      return false;
  }
}
