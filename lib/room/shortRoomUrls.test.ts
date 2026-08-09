import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPublicRoomPath, buildPublicRoomUrl } from "./publicRoomUrl";
import { isValidJoinCodeFormat, normalizeRoomCode, parsePublicRoomCodeParam } from "./roomCode";

describe("roomCode", () => {
  it("normalizes room codes to uppercase", () => {
    assert.equal(normalizeRoomCode("87zmab"), "87ZMAB");
    assert.equal(normalizeRoomCode(" 87zmab "), "87ZMAB");
  });

  it("accepts valid 6-character join codes", () => {
    assert.equal(parsePublicRoomCodeParam("87ZMAB"), "87ZMAB");
    assert.equal(parsePublicRoomCodeParam("abc123"), "ABC123");
  });

  it("rejects invalid join codes", () => {
    assert.equal(parsePublicRoomCodeParam("87ZMA"), null);
    assert.equal(parsePublicRoomCodeParam("87ZMAB1"), null);
    assert.equal(parsePublicRoomCodeParam("bad-code"), null);
    assert.equal(parsePublicRoomCodeParam(""), null);
  });

  it("matches generated join code format", () => {
    assert.equal(isValidJoinCodeFormat("K7FXSB"), true);
    assert.equal(isValidJoinCodeFormat("k7fxsb"), false);
  });
});

describe("publicRoomUrl", () => {
  it("builds short public room paths", () => {
    assert.equal(buildPublicRoomPath("87zmab"), "/r/87ZMAB");
  });

  it("builds canonical share URLs without UUIDs", () => {
    const url = buildPublicRoomUrl("https://joindraftpick.com", "87ZMAB");

    assert.equal(url, "https://joindraftpick.com/r/87ZMAB");
    assert.equal(url.includes("/room/"), false);
  });
});
