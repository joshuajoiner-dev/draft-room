"use client";

import { useEffect, useState } from "react";
import { VenuePresentation } from "@/components/presentation/VenuePresentation";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/db/client";
import type { Player } from "@/types/database";

type RoomPlayerListProps = {
  roomId: string;
  players: Player[];
  teamCount?: number;
};

export function RoomPlayerList({ roomId, players, teamCount = 0 }: RoomPlayerListProps) {
  const [visiblePlayers, setVisiblePlayers] = useState(players);

  useEffect(() => {
    setVisiblePlayers(players);
  }, [players]);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    let isActive = true;

    async function refreshPlayers() {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("room_id", roomId)
        .order("joined_at", { ascending: true });

      if (data && isActive) {
        setVisiblePlayers(data as Player[]);
      }
    }

    const pollId = window.setInterval(refreshPlayers, 2500);

    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`
        },
        refreshPlayers
      )
      .subscribe();

    return () => {
      isActive = false;
      window.clearInterval(pollId);
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <section className="card stack">
      <div className="stack-tight">
        <h2>Players</h2>
        <p className="muted">{visiblePlayers.length ? `${visiblePlayers.length} in the room` : "No players yet."}</p>
      </div>

      {visiblePlayers.length ? (
        <ul className="player-list">
          {visiblePlayers.map((player) => (
            <li className="player-row" key={player.id}>
              <span>{player.name}</span>
              {player.created_by_admin ? <span className="badge">Admin</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>No one has joined yet.</p>
          <p className="muted">Share the join link or scan the QR code to fill the room.</p>
          <VenuePresentation
            context={{ playerCount: visiblePlayers.length, teamCount, surface: "admin" }}
            placement="waiting_screen"
          />
        </div>
      )}
    </section>
  );
}
