import { normalizeRoomCode } from "@/lib/room/roomCode";

export function buildPublicRoomPath(joinCode: string) {
  return `/r/${normalizeRoomCode(joinCode)}`;
}

export function buildPublicRoomUrl(origin: string, joinCode: string) {
  return `${origin.replace(/\/$/, "")}${buildPublicRoomPath(joinCode)}`;
}

/** Host/path display for UI (full HTTPS still used for copy and QR). */
export function formatPublicRoomUrlForDisplay(fullUrl: string) {
  return fullUrl.replace(/^https?:\/\//i, "");
}
