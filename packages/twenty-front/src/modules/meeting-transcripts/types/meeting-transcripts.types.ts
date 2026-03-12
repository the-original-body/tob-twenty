export type MeetingFilterValues = {
  searchTerm: string;
  topic: string;
  host: string;
  participant: string;
  meetingId: string;
  startDateFrom: string;
};

export type TranscriptSegment = {
  type: 'speaker' | 'timestamp' | 'text';
  content: string;
};

export type MeetingTranscriptRecord = {
  id: string;
  name: string;
  createdAt: string;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  participants: string | null;
  transcript: string | null;
  summaryDE: string | null;
  summaryEN: string | null;
  executiveSummary: string | null;
  hostEmail: string | null;
  meetingTopic: string | null;
  meetingUUID: string | null;
  participantCount: number | null;
  speakerCount: number | null;
};
