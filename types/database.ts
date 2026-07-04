export type RoomStatus = "setup" | "drafting" | "finalized";
export type TeamCreationMode = "captain_draft" | "random_teams" | "balanced_random";
export type LicenseStatus =
  | "pending"
  | "active"
  | "refunded"
  | "revoked"
  | "transferred"
  | "archived";
export type LicenseOrigin =
  | "shopify"
  | "manual"
  | "organization"
  | "complimentary"
  | "test";
export type WebhookEventStatus = "received" | "processed" | "ignored_duplicate" | "failed";

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

export type UnlockCode = {
  id: string;
  code: string;
  is_active: boolean;
  redeemed_at: string | null;
  created_at: string;
};

export type License = {
  id: string;
  public_license_id: string;
  license_owner_email: string;
  billing_email: string | null;
  unlock_code_hash: string;
  license_origin: LicenseOrigin;
  purchase_date: string | null;
  created_at: string;
  updated_at: string;
  activated_at: string | null;
  status: LicenseStatus;
  last_used_at: string | null;
  recovery_enabled: boolean;
  version: number;
  notes: string | null;
  shopify_order_id: string | null;
  shopify_customer_id: string | null;
  product_key: string;
};

export type WebhookEvent = {
  id: string;
  provider: string;
  webhook_id: string;
  topic: string | null;
  shopify_order_id: string | null;
  status: WebhookEventStatus;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  processed_at: string | null;
};

export type LicenseEvent = {
  id: string;
  license_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
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
      unlock_codes: {
        Row: UnlockCode;
        Insert: {
          id?: string;
          code: string;
          is_active?: boolean;
          redeemed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<UnlockCode, "id" | "created_at">>;
      };
      licenses: {
        Row: License;
        Insert: {
          id?: string;
          public_license_id: string;
          license_owner_email: string;
          billing_email?: string | null;
          unlock_code_hash: string;
          license_origin: LicenseOrigin;
          purchase_date?: string | null;
          created_at?: string;
          updated_at?: string;
          activated_at?: string | null;
          status: LicenseStatus;
          last_used_at?: string | null;
          recovery_enabled?: boolean;
          version?: number;
          notes?: string | null;
          shopify_order_id?: string | null;
          shopify_customer_id?: string | null;
          product_key?: string;
        };
        Update: Partial<Omit<License, "id" | "created_at">>;
      };
      webhook_events: {
        Row: WebhookEvent;
        Insert: {
          id?: string;
          provider?: string;
          webhook_id: string;
          topic?: string | null;
          shopify_order_id?: string | null;
          status: WebhookEventStatus;
          error_message?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: Partial<Omit<WebhookEvent, "id" | "created_at">>;
      };
      license_events: {
        Row: LicenseEvent;
        Insert: {
          id?: string;
          license_id: string;
          event_type: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Partial<Omit<LicenseEvent, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      redeem_unlock_code: {
        Args: {
          input_code: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
