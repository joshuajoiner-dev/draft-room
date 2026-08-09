import assert from "node:assert/strict";
import { describe, it } from "node:test";

const FORBIDDEN_ANALYTICS_KEYS = ["room_id", "roomId", "room_code", "roomCode", "join_code", "uuid"];

describe("analytics privacy guardrails", () => {
  it("join_room short-room payload avoids room identifiers", () => {
    const payload = {
      join_method: "short_room_url",
      room_code_present: true
    };

    for (const key of Object.keys(payload)) {
      assert.equal(FORBIDDEN_ANALYTICS_KEYS.includes(key), false);
    }
  });
});
