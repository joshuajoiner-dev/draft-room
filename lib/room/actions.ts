"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { validateLicenseUnlockCode } from "@/lib/commerce/licenses";
import { createSupabaseServerClient, getSupabaseHost } from "@/lib/db/client";
import { normalizeName, validatePlayerName, validateRoomName } from "@/lib/room/validation";

type OverrideReturnTarget = "admin" | "draft";

const CREATE_ROOM_USER_ERROR = "We couldn't create your teams right now. Please try again.";

function createJoinCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function roomPath(roomId: string, target: OverrideReturnTarget) {
  return target === "draft" ? `/room/${roomId}/draft` : `/room/${roomId}/admin`;
}

function redirectWithOverrideError(roomId: string, target: OverrideReturnTarget, message: string): never {
  redirect(`${roomPath(roomId, target)}?error=${encodeURIComponent(message)}`);
}

function revalidateRoomPaths(roomId: string) {
  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/admin`);
  revalidatePath(`/room/${roomId}/draft`);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: unknown }).message);
  }

  return "Unknown error.";
}

function getErrorCause(error: unknown) {
  const cause = error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined;

  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message
    };
  }

  if (cause) {
    return String(cause);
  }

  return undefined;
}

function logCreateRoomFailure(error: unknown, attempt?: number) {
  const supabaseError =
    typeof error === "object" && error
      ? (error as { code?: unknown; details?: unknown; hint?: unknown; status?: unknown })
      : null;

  console.error("createRoom failed", {
    attempt,
    supabaseHost: getSupabaseHost(),
    name: error instanceof Error ? error.name : undefined,
    message: getErrorMessage(error),
    cause: getErrorCause(error),
    code: typeof supabaseError?.code === "string" ? supabaseError.code : undefined,
    details: typeof supabaseError?.details === "string" ? supabaseError.details : undefined,
    hint: typeof supabaseError?.hint === "string" ? supabaseError.hint : undefined,
    status: typeof supabaseError?.status === "number" ? supabaseError.status : undefined
  });
}

export async function validateUnlockCode(formData: FormData) {
  const code = String(formData.get("code") ?? "");

  if (!code.trim()) {
    return {
      success: false,
      message: "Enter an unlock code."
    };
  }

  try {
    const result = await validateLicenseUnlockCode(code);

    if (!result.success) {
      return {
        success: false,
        message: "Could not unlock Complete with that code."
      };
    }

    return {
      success: true,
      message: "Draft Room Complete unlocked.",
      unlock: result.payload
    };
  } catch (error) {
    console.error("validateUnlockCode failed", {
      message: getErrorMessage(error)
    });

    return {
      success: false,
      message: "Could not validate unlock code."
    };
  }
}

export async function createRoom(formData: FormData) {
  const name = normalizeName(formData.get("name"));
  const error = validateRoomName(name);

  if (error) {
    redirect(`/room/new?error=${encodeURIComponent(error)}`);
  }

  let supabase: ReturnType<typeof createSupabaseServerClient>;

  try {
    supabase = createSupabaseServerClient();
  } catch (clientError) {
    logCreateRoomFailure(clientError);
    redirect(`/room/new?error=${encodeURIComponent(CREATE_ROOM_USER_ERROR)}`);
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    let result;

    try {
      result = await supabase
        .from("rooms")
        .insert({
          name,
          join_code: createJoinCode()
        })
        .select("id")
        .single();
    } catch (insertError) {
      logCreateRoomFailure(insertError, attempt + 1);
      redirect(`/room/new?error=${encodeURIComponent(CREATE_ROOM_USER_ERROR)}`);
    }

    const { data, error: insertError } = result;

    if (data) {
      redirect(`/room/${data.id}/admin?created=1&ae=${Date.now()}`);
    }

    if (insertError?.code !== "23505") {
      logCreateRoomFailure(insertError ?? new Error("Unknown Supabase insert error."), attempt + 1);
      redirect(`/room/new?error=${encodeURIComponent(CREATE_ROOM_USER_ERROR)}`);
    }
  }

  console.error("createRoom failed", {
    supabaseHost: getSupabaseHost(),
    message: "Could not create a unique join code after 4 attempts."
  });

  redirect(`/room/new?error=${encodeURIComponent(CREATE_ROOM_USER_ERROR)}`);
}

export async function addPlayerToRoom(roomId: string, createdByAdmin: boolean, formData: FormData) {
  const name = normalizeName(formData.get("name"));
  const error = validatePlayerName(name);

  if (error) {
    const target = createdByAdmin ? `/room/${roomId}/admin` : `/room/${roomId}/join`;
    redirect(`${target}?error=${encodeURIComponent(error)}`);
  }

  const supabase = createSupabaseServerClient();
  const { error: insertError } = await supabase.from("players").insert({
    room_id: roomId,
    name,
    created_by_admin: createdByAdmin
  });

  if (insertError) {
    const target = createdByAdmin ? `/room/${roomId}/admin` : `/room/${roomId}/join`;
    redirect(`${target}?error=${encodeURIComponent(insertError.message)}`);
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/admin`);
  revalidatePath(`/room/${roomId}/join`);

  if (createdByAdmin) {
    redirect(`/room/${roomId}/admin`);
  }

  redirect(`/room/${roomId}?joined=1&ae=${Date.now()}`);
}

function parseImportedNames(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[\n,\t]+/)
    .map((name) => name.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export async function importPlayersToRoom(roomId: string, formData: FormData) {
  const parsedNames = parseImportedNames(formData.get("names"));

  if (!parsedNames.length) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Enter at least one player name.")}`);
  }

  for (const name of parsedNames) {
    const error = validatePlayerName(name);

    if (error) {
      redirect(`/room/${roomId}/admin?error=${encodeURIComponent(error)}`);
    }
  }

  const supabase = createSupabaseServerClient();
  const { data: existingPlayers, error: existingError } = await supabase
    .from("players")
    .select("name")
    .eq("room_id", roomId);

  if (existingError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(existingError.message)}`);
  }

  const seenNames = new Set((existingPlayers ?? []).map((player) => String(player.name).trim().toLowerCase()));
  const namesToImport: string[] = [];
  let duplicateCount = 0;

  for (const name of parsedNames) {
    const key = name.toLowerCase();

    if (seenNames.has(key)) {
      duplicateCount += 1;
      continue;
    }

    seenNames.add(key);
    namesToImport.push(name);
  }

  if (namesToImport.length) {
    const { error: insertError } = await supabase.from("players").insert(
      namesToImport.map((name) => ({
        room_id: roomId,
        name,
        created_by_admin: true
      }))
    );

    if (insertError) {
      redirect(`/room/${roomId}/admin?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/admin`);
  revalidatePath(`/room/${roomId}/join`);

  redirect(`/room/${roomId}/admin?imported=${namesToImport.length}&duplicates=${duplicateCount}`);
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

type TeamInput = {
  name: string;
  captain_player_id?: string | null;
  draft_order: number;
};

async function replaceRoomTeams(roomId: string, teamInputs: TeamInput[]) {
  const supabase = createSupabaseServerClient();
  const { error: deletePicksError } = await supabase.from("captain_picks").delete().eq("room_id", roomId);

  if (deletePicksError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(deletePicksError.message)}`);
  }

  const { error: deleteAssignmentsError } = await supabase.from("team_assignments").delete().eq("room_id", roomId);

  if (deleteAssignmentsError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(deleteAssignmentsError.message)}`);
  }

  const { error: clearTeamsError } = await supabase
    .from("teams")
    .update({
      captain_player_id: null,
      draft_order: null
    })
    .eq("room_id", roomId);

  if (clearTeamsError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(clearTeamsError.message)}`);
  }

  const { data: existingTeams, error: existingTeamsError } = await supabase
    .from("teams")
    .select("id")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (existingTeamsError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(existingTeamsError.message)}`);
  }

  const savedTeams = [];

  for (const [index, teamInput] of teamInputs.entries()) {
    const existingTeam = existingTeams?.[index];

    if (existingTeam) {
      const { data: updatedTeam, error: updateTeamError } = await supabase
        .from("teams")
        .update(teamInput)
        .eq("id", existingTeam.id)
        .select("id,draft_order,captain_player_id")
        .single();

      if (updateTeamError || !updatedTeam) {
        redirect(`/room/${roomId}/admin?error=${encodeURIComponent(updateTeamError?.message ?? "Could not update teams.")}`);
      }

      savedTeams.push(updatedTeam);
      continue;
    }

    const { data: insertedTeam, error: insertTeamError } = await supabase
      .from("teams")
      .insert({
        room_id: roomId,
        ...teamInput
      })
      .select("id,draft_order,captain_player_id")
      .single();

    if (insertTeamError || !insertedTeam) {
      redirect(`/room/${roomId}/admin?error=${encodeURIComponent(insertTeamError?.message ?? "Could not create teams.")}`);
    }

    savedTeams.push(insertedTeam);
  }

  return savedTeams;
}

async function generateTeams(roomId: string, formData: FormData, mode: "random_teams" | "balanced_random") {
  const teamCount = Number(formData.get("teamCount"));

  if (!Number.isInteger(teamCount) || teamCount < 2 || teamCount > 25) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Choose between 2 and 25 teams.")}`);
  }

  const supabase = createSupabaseServerClient();
  const [{ data: room, error: roomError }, { data: players, error: playersError }] = await Promise.all([
    supabase.from("rooms").select("status").eq("id", roomId).single(),
    supabase.from("players").select("id").eq("room_id", roomId)
  ]);

  if (roomError || !room) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(roomError?.message ?? "Room not found.")}`);
  }

  if (room.status === "finalized") {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Finalized teams cannot be regenerated.")}`);
  }

  if (playersError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(playersError.message)}`);
  }

  const roomPlayers = players ?? [];

  if (!roomPlayers.length) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Import players before generating teams.")}`);
  }

  const teams = await replaceRoomTeams(
    roomId,
    Array.from({ length: teamCount }, (_, index) => ({
      name: `Team ${index + 1}`,
      captain_player_id: null,
      draft_order: index + 1
    }))
  );

  const orderedTeams = [...teams].sort((left, right) => Number(left.draft_order) - Number(right.draft_order));
  const shuffledPlayers = shuffle(roomPlayers);
  const assignments = shuffledPlayers.map((player, index) => ({
    room_id: roomId,
    team_id: orderedTeams[index % orderedTeams.length].id,
    player_id: player.id
  }));

  if (assignments.length) {
    const { error: assignmentError } = await supabase.from("team_assignments").insert(assignments);

    if (assignmentError) {
      redirect(`/room/${roomId}/admin?error=${encodeURIComponent(assignmentError.message)}`);
    }
  }

  const { error: updateRoomError } = await supabase
    .from("rooms")
    .update({
      team_creation_mode: mode,
      updated_at: new Date().toISOString()
    })
    .eq("id", roomId);

  if (updateRoomError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(updateRoomError.message)}`);
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/admin`);

  const queryType = mode === "balanced_random" ? "balancedTeams" : "teams";
  redirect(`/room/${roomId}/admin?${queryType}=${teamCount}&assigned=${roomPlayers.length}&ae=${Date.now()}`);
}

export async function generateRandomTeams(roomId: string, formData: FormData) {
  await generateTeams(roomId, formData, "random_teams");
}

export async function generateBalancedRandomTeams(roomId: string, formData: FormData) {
  await generateTeams(roomId, formData, "balanced_random");
}

async function createCaptainDraftSetup(roomId: string, captainIds: string[], captainsRandomized: boolean) {
  const supabase = createSupabaseServerClient();
  const [{ data: room, error: roomError }, { data: players, error: playersError }] = await Promise.all([
    supabase.from("rooms").select("status").eq("id", roomId).single(),
    supabase.from("players").select("id").eq("room_id", roomId)
  ]);

  if (roomError || !room) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(roomError?.message ?? "Room not found.")}`);
  }

  if (room.status === "finalized") {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Finalized teams cannot be changed.")}`);
  }

  if (playersError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(playersError.message)}`);
  }

  const roomPlayerIds = new Set((players ?? []).map((player) => player.id));
  const uniqueCaptainIds = [...new Set(captainIds)];

  if (uniqueCaptainIds.length !== captainIds.length) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Choose one unique captain per team.")}`);
  }

  if (!captainIds.every((captainId) => roomPlayerIds.has(captainId))) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Choose captains from the current room players.")}`);
  }

  const teams = await replaceRoomTeams(
    roomId,
    captainIds.map((captainId, index) => ({
      name: `Team ${index + 1}`,
      captain_player_id: captainId,
      draft_order: index + 1
    }))
  );

  const captainAssignments = [...teams]
    .sort((left, right) => Number(left.draft_order) - Number(right.draft_order))
    .map((team) => ({
      room_id: roomId,
      team_id: team.id,
      player_id: team.captain_player_id
    }));

  const { error: assignmentError } = await supabase.from("team_assignments").insert(captainAssignments);

  if (assignmentError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(assignmentError.message)}`);
  }

  const { error: updateRoomError } = await supabase
    .from("rooms")
    .update({
      team_creation_mode: "captain_draft",
      updated_at: new Date().toISOString()
    })
    .eq("id", roomId);

  if (updateRoomError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(updateRoomError.message)}`);
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/admin`);

  redirect(
    `/room/${roomId}/admin?captainTeams=${captainIds.length}&captainsRandomized=${captainsRandomized ? 1 : 0}&ae=${Date.now()}`
  );
}

export async function setupCaptainDraft(roomId: string, formData: FormData) {
  const teamCount = Number(formData.get("teamCount"));

  if (!Number.isInteger(teamCount) || teamCount < 2 || teamCount > 25) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Choose between 2 and 25 captain teams.")}`);
  }

  const captainIds = Array.from({ length: teamCount }, (_, index) => String(formData.get(`captainId-${index}`) ?? ""));

  if (captainIds.some((captainId) => !captainId)) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Choose one captain for each team.")}`);
  }

  await createCaptainDraftSetup(roomId, captainIds, false);
}

export async function randomizeCaptains(roomId: string, formData: FormData) {
  const teamCount = Number(formData.get("teamCount"));

  if (!Number.isInteger(teamCount) || teamCount < 2 || teamCount > 25) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Choose between 2 and 25 captain teams.")}`);
  }

  const supabase = createSupabaseServerClient();
  const { data: players, error: playersError } = await supabase.from("players").select("id").eq("room_id", roomId);

  if (playersError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(playersError.message)}`);
  }

  const roomPlayers = players ?? [];

  if (roomPlayers.length < teamCount) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Import at least one player per captain team.")}`);
  }

  await createCaptainDraftSetup(
    roomId,
    shuffle(roomPlayers)
      .slice(0, teamCount)
      .map((player) => player.id),
    true
  );
}

export async function beginCaptainDraft(roomId: string) {
  const supabase = createSupabaseServerClient();
  const [{ data: room, error: roomError }, { data: teams, error: teamsError }] = await Promise.all([
    supabase.from("rooms").select("team_creation_mode,status").eq("id", roomId).single(),
    supabase
      .from("teams")
      .select("id,captain_player_id,draft_order")
      .eq("room_id", roomId)
      .not("draft_order", "is", null)
      .order("draft_order", { ascending: true })
  ]);

  if (roomError || !room) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(roomError?.message ?? "Room not found.")}`);
  }

  if (room.team_creation_mode !== "captain_draft") {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Set up Captain Draft before beginning.")}`);
  }

  if (!teams?.length || teams.some((team) => !team.captain_player_id)) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Choose one captain for each team before beginning.")}`);
  }

  if (room.status === "finalized") {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent("Finalized teams cannot enter draft.")}`);
  }

  const { error: updateRoomError } = await supabase
    .from("rooms")
    .update({
      status: "drafting",
      updated_at: new Date().toISOString()
    })
    .eq("id", roomId);

  if (updateRoomError) {
    redirect(`/room/${roomId}/admin?error=${encodeURIComponent(updateRoomError.message)}`);
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/admin`);
  revalidatePath(`/room/${roomId}/draft`);

  redirect(`/room/${roomId}/draft`);
}

export async function makeCaptainPick(roomId: string, playerId: string) {
  const supabase = createSupabaseServerClient();
  const [
    { data: room, error: roomError },
    { data: teams, error: teamsError },
    { data: assignments, error: assignmentsError },
    { data: captainPicks, error: captainPicksError }
  ] = await Promise.all([
    supabase.from("rooms").select("status,team_creation_mode").eq("id", roomId).single(),
    supabase
      .from("teams")
      .select("id,captain_player_id,draft_order")
      .eq("room_id", roomId)
      .not("draft_order", "is", null)
      .order("draft_order", { ascending: true }),
    supabase.from("team_assignments").select("player_id").eq("room_id", roomId),
    supabase.from("captain_picks").select("pick_number").eq("room_id", roomId).order("pick_number", { ascending: true })
  ]);

  if (roomError || !room) {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent(roomError?.message ?? "Room not found.")}`);
  }

  if (room.status !== "drafting" || room.team_creation_mode !== "captain_draft") {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent("Captain Draft is not active.")}`);
  }

  if (teamsError || !teams?.length) {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent(teamsError?.message ?? "No captain teams found.")}`);
  }

  if (assignmentsError) {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent(assignmentsError.message)}`);
  }

  if (captainPicksError) {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent(captainPicksError.message)}`);
  }

  const assignedPlayerIds = new Set((assignments ?? []).map((assignment) => assignment.player_id));

  if (assignedPlayerIds.has(playerId)) {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent("That player has already been assigned.")}`);
  }

  const pickCount = captainPicks?.length ?? 0;
  const currentTeam = teams[pickCount % teams.length];
  const pickNumber = pickCount + 1;
  const roundNumber = Math.floor(pickCount / teams.length) + 1;

  const { error: assignmentInsertError } = await supabase.from("team_assignments").insert({
    room_id: roomId,
    team_id: currentTeam.id,
    player_id: playerId
  });

  if (assignmentInsertError) {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent(assignmentInsertError.message)}`);
  }

  const { error: pickInsertError } = await supabase.from("captain_picks").insert({
    room_id: roomId,
    team_id: currentTeam.id,
    player_id: playerId,
    pick_number: pickNumber,
    round_number: roundNumber
  });

  if (pickInsertError) {
    redirect(`/room/${roomId}/draft?error=${encodeURIComponent(pickInsertError.message)}`);
  }

  revalidatePath(`/room/${roomId}`);
  revalidatePath(`/room/${roomId}/draft`);
  revalidatePath(`/room/${roomId}/admin`);

  redirect(`/room/${roomId}/draft`);
}

async function ensureRoomCanOverride(roomId: string, target: OverrideReturnTarget) {
  const supabase = createSupabaseServerClient();
  const { data: room, error } = await supabase.from("rooms").select("status").eq("id", roomId).single();

  if (error || !room) {
    redirectWithOverrideError(roomId, target, error?.message ?? "Room not found.");
  }

  if (room.status === "finalized") {
    redirectWithOverrideError(roomId, target, "Finalized teams cannot be changed.");
  }

  return supabase;
}

export async function unassignPlayer(roomId: string, playerId: string, target: OverrideReturnTarget) {
  const supabase = await ensureRoomCanOverride(roomId, target);
  const { data: assignment, error: assignmentError } = await supabase
    .from("team_assignments")
    .select("team_id")
    .eq("room_id", roomId)
    .eq("player_id", playerId)
    .single();

  if (assignmentError || !assignment) {
    redirectWithOverrideError(roomId, target, assignmentError?.message ?? "Player is not assigned to a team.");
  }

  const { data: captainPick, error: captainPickError } = await supabase
    .from("captain_picks")
    .select("team_id,pick_number,round_number")
    .eq("room_id", roomId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (captainPickError) {
    redirectWithOverrideError(roomId, target, captainPickError.message);
  }

  const { error: deleteAssignmentError } = await supabase
    .from("team_assignments")
    .delete()
    .eq("room_id", roomId)
    .eq("player_id", playerId);

  if (deleteAssignmentError) {
    redirectWithOverrideError(roomId, target, deleteAssignmentError.message);
  }

  if (captainPick) {
    const { error: deletePickError } = await supabase
      .from("captain_picks")
      .delete()
      .eq("room_id", roomId)
      .eq("player_id", playerId);

    if (deletePickError) {
      redirectWithOverrideError(roomId, target, deletePickError.message);
    }
  }

  const { error: undoError } = await supabase.from("undo_stack").insert({
    room_id: roomId,
    action_type: "unassign",
    payload: {
      playerId,
      previousTeamId: assignment.team_id,
      captainPick
    }
  });

  if (undoError) {
    redirectWithOverrideError(roomId, target, undoError.message);
  }

  revalidateRoomPaths(roomId);
  redirect(roomPath(roomId, target));
}

export async function reassignPlayer(roomId: string, playerId: string, target: OverrideReturnTarget, formData: FormData) {
  const nextTeamId = String(formData.get("teamId") ?? "");

  if (!nextTeamId) {
    redirectWithOverrideError(roomId, target, "Choose a team.");
  }

  const supabase = await ensureRoomCanOverride(roomId, target);
  const [
    { data: assignment, error: assignmentError },
    { data: nextTeam, error: nextTeamError }
  ] = await Promise.all([
    supabase
      .from("team_assignments")
      .select("team_id")
      .eq("room_id", roomId)
      .eq("player_id", playerId)
      .single(),
    supabase.from("teams").select("id").eq("room_id", roomId).eq("id", nextTeamId).single()
  ]);

  if (assignmentError || !assignment) {
    redirectWithOverrideError(roomId, target, assignmentError?.message ?? "Player is not assigned to a team.");
  }

  if (nextTeamError || !nextTeam) {
    redirectWithOverrideError(roomId, target, nextTeamError?.message ?? "Choose a team from this room.");
  }

  if (assignment.team_id === nextTeamId) {
    redirect(roomPath(roomId, target));
  }

  const { error: updateError } = await supabase
    .from("team_assignments")
    .update({ team_id: nextTeamId })
    .eq("room_id", roomId)
    .eq("player_id", playerId);

  if (updateError) {
    redirectWithOverrideError(roomId, target, updateError.message);
  }

  const { error: undoError } = await supabase.from("undo_stack").insert({
    room_id: roomId,
    action_type: "reassign",
    payload: {
      playerId,
      previousTeamId: assignment.team_id,
      nextTeamId
    }
  });

  if (undoError) {
    redirectWithOverrideError(roomId, target, undoError.message);
  }

  revalidateRoomPaths(roomId);
  redirect(roomPath(roomId, target));
}

export async function undoLatestAssignment(roomId: string, target: OverrideReturnTarget) {
  const supabase = await ensureRoomCanOverride(roomId, target);
  const [
    { data: undoItems, error: undoError },
    { data: captainPicks, error: captainPicksError }
  ] = await Promise.all([
    supabase.from("undo_stack").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(1),
    supabase.from("captain_picks").select("*").eq("room_id", roomId).order("pick_number", { ascending: false }).limit(1)
  ]);

  if (undoError) {
    redirectWithOverrideError(roomId, target, undoError.message);
  }

  if (captainPicksError) {
    redirectWithOverrideError(roomId, target, captainPicksError.message);
  }

  const undoItem = undoItems?.[0];
  const captainPick = captainPicks?.[0];
  const shouldUndoStack =
    undoItem && (!captainPick || new Date(undoItem.created_at).getTime() >= new Date(captainPick.created_at).getTime());

  if (shouldUndoStack) {
    const payload = undoItem.payload as {
      playerId?: string;
      previousTeamId?: string;
      captainPick?: {
        team_id?: string;
        pick_number?: number;
        round_number?: number;
      } | null;
    };

    if (!payload.playerId || !payload.previousTeamId) {
      redirectWithOverrideError(roomId, target, "Undo data is incomplete.");
    }

    if (undoItem.action_type === "unassign") {
      const { data: existingAssignment, error: existingAssignmentError } = await supabase
        .from("team_assignments")
        .select("id")
        .eq("room_id", roomId)
        .eq("player_id", payload.playerId)
        .maybeSingle();

      if (existingAssignmentError) {
        redirectWithOverrideError(roomId, target, existingAssignmentError.message);
      }

      if (existingAssignment) {
        redirectWithOverrideError(roomId, target, "That player is already assigned.");
      }

      const { error: insertAssignmentError } = await supabase.from("team_assignments").insert({
        room_id: roomId,
        team_id: payload.previousTeamId,
        player_id: payload.playerId
      });

      if (insertAssignmentError) {
        redirectWithOverrideError(roomId, target, insertAssignmentError.message);
      }

      if (payload.captainPick?.team_id && payload.captainPick.pick_number && payload.captainPick.round_number) {
        const { error: insertPickError } = await supabase.from("captain_picks").insert({
          room_id: roomId,
          team_id: payload.captainPick.team_id,
          player_id: payload.playerId,
          pick_number: payload.captainPick.pick_number,
          round_number: payload.captainPick.round_number
        });

        if (insertPickError) {
          redirectWithOverrideError(roomId, target, insertPickError.message);
        }
      }
    } else if (undoItem.action_type === "reassign") {
      const { error: updateAssignmentError } = await supabase
        .from("team_assignments")
        .update({ team_id: payload.previousTeamId })
        .eq("room_id", roomId)
        .eq("player_id", payload.playerId);

      if (updateAssignmentError) {
        redirectWithOverrideError(roomId, target, updateAssignmentError.message);
      }
    } else {
      redirectWithOverrideError(roomId, target, "That assignment cannot be undone.");
    }

    const { error: deleteUndoError } = await supabase.from("undo_stack").delete().eq("id", undoItem.id);

    if (deleteUndoError) {
      redirectWithOverrideError(roomId, target, deleteUndoError.message);
    }

    revalidateRoomPaths(roomId);
    redirect(roomPath(roomId, target));
  }

  if (captainPick) {
    const { error: deleteAssignmentError } = await supabase
      .from("team_assignments")
      .delete()
      .eq("room_id", roomId)
      .eq("player_id", captainPick.player_id);

    if (deleteAssignmentError) {
      redirectWithOverrideError(roomId, target, deleteAssignmentError.message);
    }

    const { error: deletePickError } = await supabase.from("captain_picks").delete().eq("id", captainPick.id);

    if (deletePickError) {
      redirectWithOverrideError(roomId, target, deletePickError.message);
    }

    revalidateRoomPaths(roomId);
    redirect(roomPath(roomId, target));
  }

  redirectWithOverrideError(roomId, target, "There is no assignment to undo.");
}
