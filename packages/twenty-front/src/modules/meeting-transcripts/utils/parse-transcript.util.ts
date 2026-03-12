import { type TranscriptSegment } from '@/meeting-transcripts/types/meeting-transcripts.types';

// Matches patterns like "Speaker Name [3:15]:" or "Speaker Name [03:15]:" or "Speaker Name:"
const SPEAKER_LINE_REGEX = /^@?(.+?)(?:\s*\[[\d:]+\])?\s*:\s*$/;

// Matches timestamp patterns like "[3:15]" or "[03:15:30]"
const TIMESTAMP_REGEX = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/;

export const parseTranscriptSegments = (
  rawTranscript: string,
): TranscriptSegment[] => {
  if (!rawTranscript || rawTranscript.trim().length === 0) {
    return [];
  }

  const lines = rawTranscript.split('\n');
  const segments: TranscriptSegment[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      continue;
    }

    // Check if this line is a speaker line (e.g., "@Pablo Perez [3:15]:")
    const speakerMatch = trimmed.match(SPEAKER_LINE_REGEX);

    if (speakerMatch) {
      const speakerName = speakerMatch[1].trim();
      const timestampMatch = trimmed.match(TIMESTAMP_REGEX);

      if (timestampMatch) {
        segments.push({ type: 'timestamp', content: timestampMatch[1] });
      }

      segments.push({ type: 'speaker', content: speakerName });
      continue;
    }

    // Check if line starts with a speaker pattern like "@Name [time]: text"
    const inlineSpeakerMatch = trimmed.match(
      /^@?(.+?)\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*:\s*(.+)$/,
    );

    if (inlineSpeakerMatch) {
      segments.push({
        type: 'timestamp',
        content: inlineSpeakerMatch[2],
      });
      segments.push({
        type: 'speaker',
        content: inlineSpeakerMatch[1].trim(),
      });
      segments.push({
        type: 'text',
        content: inlineSpeakerMatch[3].trim(),
      });
      continue;
    }

    // Regular text line
    segments.push({ type: 'text', content: trimmed });
  }

  // Fallback: if no structure was detected, return the raw text as a single segment
  if (
    segments.length > 0 &&
    segments.every((segment) => segment.type === 'text')
  ) {
    return [{ type: 'text', content: rawTranscript.trim() }];
  }

  return segments;
};

export const extractParticipants = (rawTranscript: string): string[] => {
  if (!rawTranscript || rawTranscript.trim().length === 0) {
    return [];
  }

  const participants = new Set<string>();
  const lines = rawTranscript.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match "@Name [time]:" pattern
    const inlineMatch = trimmed.match(
      /^@?(.+?)\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*:/,
    );

    if (inlineMatch) {
      participants.add(inlineMatch[1].trim());
      continue;
    }

    // Match "Name:" pattern at start of line (standalone speaker line)
    const speakerMatch = trimmed.match(SPEAKER_LINE_REGEX);

    if (speakerMatch) {
      participants.add(speakerMatch[1].trim());
    }
  }

  return Array.from(participants).sort();
};
