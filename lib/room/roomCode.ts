const JOIN_CODE_LENGTH = 6;
const JOIN_CODE_PATTERN = /^[0-9A-Z]{6}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeRoomCode(value: string) {
  return value.trim().toUpperCase();
}

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export function isValidJoinCodeFormat(code: string) {
  return JOIN_CODE_PATTERN.test(code);
}

export function parsePublicRoomCodeParam(raw: string) {
  const normalized = normalizeRoomCode(raw);

  if (!isValidJoinCodeFormat(normalized)) {
    return null;
  }

  return normalized;
}

export const JOIN_CODE_FORMAT_MESSAGE = "Room codes are 6 letters or numbers.";
