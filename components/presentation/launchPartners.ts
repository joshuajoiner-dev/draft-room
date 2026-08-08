export type LaunchPartnerKey =
  | "joindraftpick"
  | "french-learning-lab"
  | "ona-pass"
  | "provision247"
  | "movement-mix"
  | "muscular-america"
  | "launch-partner-open";

export type LaunchPartnerPlacementKey =
  | "admin_left_below_overview"
  | "admin_below_qr"
  | "admin_waiting_players"
  | "admin_right_below_founder"
  | "admin_footer_ribbon"
  | "admin_launch_partner_open";

export type LaunchPartnerCategory = "ecosystem" | "open";

export type LaunchPartnerConfig = {
  key: LaunchPartnerKey;
  name: string;
  imageSrc: string | null;
  href: string | null;
  alt: string;
  active: boolean;
  category: LaunchPartnerCategory;
  placementPreference: LaunchPartnerPlacementKey[];
};

export const launchPartners: Record<LaunchPartnerKey, LaunchPartnerConfig> = {
  joindraftpick: {
    key: "joindraftpick",
    name: "JoinDraftPick",
    imageSrc: "/sponsors/joindraftpick.jpg",
    href: "https://joindraftpick.com",
    alt: "JoinDraftPick team formation partner",
    active: true,
    category: "ecosystem",
    placementPreference: ["admin_footer_ribbon"]
  },
  "french-learning-lab": {
    key: "french-learning-lab",
    name: "French Learning Lab",
    imageSrc: "/sponsors/french-learning-lab.jpg",
    href: "https://frenchlearninglab.com",
    alt: "French Learning Lab language learning partner",
    active: true,
    category: "ecosystem",
    placementPreference: ["admin_left_below_overview", "admin_waiting_players"]
  },
  "ona-pass": {
    key: "ona-pass",
    name: "Ona Pass",
    imageSrc: "/sponsors/ona-pass.jpg",
    href: "https://onapass.org",
    alt: "Ona Pass digital hall pass partner",
    active: true,
    category: "ecosystem",
    placementPreference: ["admin_left_below_overview", "admin_right_below_founder"]
  },
  provision247: {
    key: "provision247",
    name: "Provision247",
    imageSrc: "/sponsors/provision247.jpg",
    href: "https://provision247.com",
    alt: "Provision247 micro market partner",
    active: true,
    category: "ecosystem",
    placementPreference: ["admin_below_qr"]
  },
  "movement-mix": {
    key: "movement-mix",
    name: "Provision247 Movement Mix",
    imageSrc: "/sponsors/movement-mix.jpg",
    href: "https://muscularamerica.com/pages/provision247",
    alt: "Provision247 Movement Mix performance partner",
    active: true,
    category: "ecosystem",
    placementPreference: ["admin_waiting_players"]
  },
  "muscular-america": {
    key: "muscular-america",
    name: "Muscular America",
    imageSrc: "/sponsors/muscular-america.jpg",
    href: "https://muscularamerica.com",
    alt: "Muscular America strength education partner",
    active: true,
    category: "ecosystem",
    placementPreference: ["admin_below_qr", "admin_right_below_founder"]
  },
  "launch-partner-open": {
    key: "launch-partner-open",
    name: "Launch Partner",
    imageSrc: null,
    href: null,
    alt: "Launch partner sponsorship opportunity",
    active: true,
    category: "open",
    placementPreference: ["admin_launch_partner_open"]
  }
};

export const ENABLE_LAUNCH_PARTNER_ARTWORK = true;
