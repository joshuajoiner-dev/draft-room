import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/db/client";
import { normalizeRoomCode, parsePublicRoomCodeParam } from "@/lib/room/roomCode";
import type { CaptainPick, Player, Room, Team, TeamAssignment } from "@/types/database";

export type RoomState = {
  room: Room;
  players: Player[];
  teams: Team[];
  assignments: TeamAssignment[];
};

export type CaptainDraftState = RoomState & {
  captainPicks: CaptainPick[];
};

export async function getRoomState(roomId: string): Promise<RoomState> {
  noStore();

  if (!hasSupabaseConfig()) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createSupabaseServerClient();

  const [
    { data: room, error: roomError },
    { data: players, error: playersError },
    { data: teams, error: teamsError },
    { data: assignments, error: assignmentsError }
  ] = await Promise.all([
    supabase.from("rooms").select("*").eq("id", roomId).single(),
    supabase.from("players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true }),
    supabase
      .from("teams")
      .select("*")
      .eq("room_id", roomId)
      .not("draft_order", "is", null)
      .order("draft_order", { ascending: true }),
    supabase.from("team_assignments").select("*").eq("room_id", roomId).order("assigned_at", { ascending: true })
  ]);

  if (roomError || !room) {
    notFound();
  }

  if (playersError) {
    throw new Error(playersError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (assignmentsError) {
    throw new Error(assignmentsError.message);
  }

  return {
    room,
    players: players ?? [],
    teams: teams ?? [],
    assignments: assignments ?? []
  };
}

async function getRoomStateForRoom(room: Room): Promise<RoomState> {
  if (!hasSupabaseConfig()) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createSupabaseServerClient();
  const roomId = room.id;

  const [
    { data: players, error: playersError },
    { data: teams, error: teamsError },
    { data: assignments, error: assignmentsError }
  ] = await Promise.all([
    supabase.from("players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true }),
    supabase
      .from("teams")
      .select("*")
      .eq("room_id", roomId)
      .not("draft_order", "is", null)
      .order("draft_order", { ascending: true }),
    supabase.from("team_assignments").select("*").eq("room_id", roomId).order("assigned_at", { ascending: true })
  ]);

  if (playersError) {
    throw new Error(playersError.message);
  }

  if (teamsError) {
    throw new Error(teamsError.message);
  }

  if (assignmentsError) {
    throw new Error(assignmentsError.message);
  }

  return {
    room,
    players: players ?? [],
    teams: teams ?? [],
    assignments: assignments ?? []
  };
}

export async function getRoomStateByJoinCode(rawJoinCode: string): Promise<RoomState> {
  noStore();

  const joinCode = parsePublicRoomCodeParam(rawJoinCode);

  if (!joinCode) {
    notFound();
  }

  if (!hasSupabaseConfig()) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createSupabaseServerClient();
  const { data: room, error: roomError } = await supabase.from("rooms").select("*").eq("join_code", joinCode).maybeSingle();

  if (roomError) {
    throw new Error(roomError.message);
  }

  if (!room) {
    notFound();
  }

  return getRoomStateForRoom(room as Room);
}

export async function getRoomJoinCode(roomId: string): Promise<string | null> {
  if (!hasSupabaseConfig()) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("rooms").select("join_code").eq("id", roomId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.join_code ? normalizeRoomCode(data.join_code) : null;
}

export async function getCaptainDraftState(roomId: string): Promise<CaptainDraftState> {
  const roomState = await getRoomState(roomId);

  if (!hasSupabaseConfig()) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createSupabaseServerClient();
  const { data: captainPicks, error: captainPicksError } = await supabase
    .from("captain_picks")
    .select("*")
    .eq("room_id", roomId)
    .order("pick_number", { ascending: true });

  if (captainPicksError) {
    throw new Error(captainPicksError.message);
  }

  return {
    ...roomState,
    captainPicks: captainPicks ?? []
  };
}
