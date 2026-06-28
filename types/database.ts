export type RoomStatus = "setup" | "drafting" | "finalized";
export type TeamCreationMode = "captain_draft" | "random_teams" | "balanced_random";

export type Room = {
  id: string;
  name: string;
  join_code: string;
  status: RoomStatus;
  team_creation_mode: TeamCreationMode | null;
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  room_id: string;
  name: string;
  joined_at: string;
  created_by_admin: boolean;
};

export type Team = {
  id: string;
  room_id: string;
  name: string;
  captain_player_id: string | null;
  draft_order: number | null;
  created_at: string;
};

export type TeamAssignment = {
  id: string;
  room_id: string;
  team_id: string;
  player_id: string;
  assigned_at: string;
};

export type CaptainPick = {
  id: string;
  room_id: string;
  team_id: string;
  player_id: string;
  pick_number: number;
  round_number: number;
  created_at: string;
};

export type UndoStackItem = {
  id: string;
  room_id: string;
  action_type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: {
          id?: string;
          name: string;
          join_code: string;
          status?: RoomStatus;
          team_creation_mode?: TeamCreationMode | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Room, "id" | "created_at">>;
      };
      players: {
        Row: Player;
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          joined_at?: string;
          created_by_admin?: boolean;
        };
        Update: Partial<Omit<Player, "id" | "room_id">>;
      };
      teams: {
        Row: Team;
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          captain_player_id?: string | null;
          draft_order?: number | null;
          created_at?: string;
        };
        Update: Partial<Omit<Team, "id" | "room_id" | "created_at">>;
      };
      team_assignments: {
        Row: TeamAssignment;
        Insert: {
          id?: string;
          room_id: string;
          team_id: string;
          player_id: string;
          assigned_at?: string;
        };
        Update: Partial<Omit<TeamAssignment, "id" | "room_id">>;
      };
      captain_picks: {
        Row: CaptainPick;
        Insert: {
          id?: string;
          room_id: string;
          team_id: string;
          player_id: string;
          pick_number: number;
          round_number: number;
          created_at?: string;
        };
        Update: Partial<Omit<CaptainPick, "id" | "room_id" | "created_at">>;
      };
      undo_stack: {
        Row: UndoStackItem;
        Insert: {
          id?: string;
          room_id: string;
          action_type: string;
          payload: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Omit<UndoStackItem, "id" | "room_id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
