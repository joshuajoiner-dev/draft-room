import { normalizeRoomCode } from "@/lib/room/roomCode";

export function buildPublicRoomPath(joinCode: string) {
  return `/r/${normalizeRoomCode(joinCode)}`;
}

export function buildPublicRoomUrl(origin: string, joinCode: string) {
  return `${origin.replace(/\/$/, "")}${buildPublicRoomPath(joinCode)}`;
}
