export type ParsedParticipant = {
  name: string;
  team: string | null;
};

export const parseParticipants = (
  rawParticipants: string | null,
): ParsedParticipant[] => {
  if (!rawParticipants || rawParticipants.trim().length === 0) {
    return [];
  }

  return rawParticipants
    .split(',')
    .map((entry) => {
      const trimmed = entry.trim();

      if (trimmed.length === 0) {
        return null;
      }

      const parts = trimmed.split(' | ');

      if (parts.length >= 2) {
        return {
          name: parts[0].trim(),
          team: parts.slice(1).join(' | ').trim(),
        };
      }

      return {
        name: trimmed,
        team: null,
      };
    })
    .filter(
      (participant): participant is ParsedParticipant =>
        participant !== null && participant.name.length > 0,
    );
};
