const MAX_NAME_LENGTH = 80;

export function normalizeName(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function validateRoomName(name: string) {
  if (!name) {
    return "Room name is required.";
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `Room name must be ${MAX_NAME_LENGTH} characters or less.`;
  }

  return null;
}

export function validatePlayerName(name: string) {
  if (!name) {
    return "Player name is required.";
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `Player name must be ${MAX_NAME_LENGTH} characters or less.`;
  }

  return null;
}
