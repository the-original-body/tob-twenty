import { type RecordGqlOperationFilter } from 'twenty-shared/types';

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

export type MeetingRecord = {
  id: string;
  name: string;
  createdAt: string;
  firefliesMeetingId: string | null;
  meetingDate: string | null;
  duration: number | null;
  organizerEmail: string | null;
  transcript: string | null;
  overview: string | null;
  notes: string | null;
  keywords: string | null;
  meetingType: string | null;
  topics: string | null;
};

export type MeetingFilterBuilder = (
  filterValues: MeetingFilterValues,
) => RecordGqlOperationFilter | undefined;
