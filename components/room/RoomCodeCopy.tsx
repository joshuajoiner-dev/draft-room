"use client";

import { useState } from "react";

type RoomCodeCopyProps = {
  code: string;
};

export function RoomCodeCopy({ code }: RoomCodeCopyProps) {
  const [copied, setCopied] = useState(false);

  async function copyRoomCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  }

  return (
    <button
      aria-label={`Copy room code ${code}`}
      className="room-code"
      onClick={copyRoomCode}
      type="button"
    >
      <span>Room Code</span>
      <strong>{code}</strong>
      <em role="status">{copied ? "Copied" : "Tap to copy"}</em>
    </button>
  );
}
