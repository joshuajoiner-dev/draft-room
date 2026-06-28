import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/db/client";
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
