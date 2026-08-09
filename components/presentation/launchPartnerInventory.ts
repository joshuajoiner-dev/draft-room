import { launchPartners, type LaunchPartnerKey, type LaunchPartnerPlacementKey } from "@/components/presentation/launchPartners";

export type AdminLaunchPartnerContext = {
  roomId: string;
  playerCount: number;
  teamCount: number;
};

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickPartner(candidates: LaunchPartnerKey[], seed: string): LaunchPartnerKey {
  const activeCandidates = candidates.filter((key) => launchPartners[key]?.active);

  if (!activeCandidates.length) {
    return candidates[0];
  }

  return activeCandidates[hashSeed(seed) % activeCandidates.length];
}

/**
 * Assigns at most three ecosystem sponsors plus the open launch slot for the admin room.
 */
export function resolveAdminLaunchPartnerPlacements(
  context: AdminLaunchPartnerContext
): Partial<Record<LaunchPartnerPlacementKey, LaunchPartnerKey>> {
  const { roomId, playerCount, teamCount } = context;

  const assignments: Partial<Record<LaunchPartnerPlacementKey, LaunchPartnerKey>> = {
    admin_left_below_overview: pickPartner(["ona-pass", "french-learning-lab"], `${roomId}:left`),
    admin_below_qr: pickPartner(["provision247", "muscular-america"], `${roomId}:qr`),
    admin_launch_partner_open: "launch-partner-open"
  };

  if (playerCount === 0) {
    assignments.admin_waiting_players = pickPartner(["movement-mix", "french-learning-lab"], `${roomId}:wait`);
  } else if (teamCount === 0) {
    assignments.admin_right_below_founder = pickPartner(["muscular-america", "ona-pass"], `${roomId}:right`);
  } else {
    assignments.admin_footer_ribbon = pickPartner(
      ["joindraftpick", "french-learning-lab", "ona-pass"],
      `${roomId}:footer`
    );
  }

  return assignments;
}

export function getLaunchPartnerForPlacement(
  context: AdminLaunchPartnerContext,
  placement: LaunchPartnerPlacementKey
): LaunchPartnerKey | null {
  const assignments = resolveAdminLaunchPartnerPlacements(context);
  return assignments[placement] ?? null;
}
