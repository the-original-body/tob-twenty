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
  meetingStartTime: string | null;
  meetingEndTime: string | null;
  meetingDuration: string | null;
  participants: string | null;
  transcriptText: string | null;
  zusammenfassung: string | null;
  summaryEng: string | null;
  zusammenfassungLang: string | null;
  hostEmail: string | null;
  meetingTopic: string | null;
  meetingUuid: string | null;
  participantCount: number | null;
  speakerCount: number | null;
};
