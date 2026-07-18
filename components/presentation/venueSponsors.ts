export type VenueSponsorPlacement =
  | "leaderboard"
  | "below_qr"
  | "footer"
  | "timer_panel"
  | "waiting_screen"
  | "printable_roster_footer";

export type VenueSponsor = {
  label: string;
  name: string;
  tagline?: string;
};

/** Static demo sponsors for venue exploration. Replace with resolver when campaigns ship. */
export const venueSponsors: Partial<Record<VenueSponsorPlacement, VenueSponsor>> = {
  leaderboard: {
    label: "Scoreboard Partner",
    name: "Community Recreation",
    tagline: "Proud supporter of youth sports"
  },
  below_qr: {
    label: "Presented by",
    name: "Hydration Partner"
  },
  footer: {
    label: "Event Partner",
    name: "Local Sports Shop",
    tagline: "Official community partner"
  },
  timer_panel: {
    label: "Presented by",
    name: "Sports Medicine Clinic"
  },
  waiting_screen: {
    label: "Tonight's Room Sponsor",
    name: "Parks & Recreation"
  },
  printable_roster_footer: {
    label: "Official Partner",
    name: "Booster Club",
    tagline: "Supporting student athletes"
  }
};

export const ENABLE_VENUE_SPONSORS = true;
