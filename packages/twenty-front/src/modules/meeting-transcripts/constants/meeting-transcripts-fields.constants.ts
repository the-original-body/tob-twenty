import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

// Fields fetched for the list view (lightweight)
export const MEETING_LIST_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  firefliesMeetingId: true,
  meetingDate: true,
  duration: true,
  organizerEmail: true,
};

// Fields fetched for the detail view (full)
export const MEETING_DETAIL_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  firefliesMeetingId: true,
  meetingDate: true,
  duration: true,
  organizerEmail: true,
  transcript: true,
  overview: true,
  notes: true,
  keywords: true,
  meetingType: true,
  topics: true,
};

export const INITIAL_FILTER_VALUES: MeetingFilterValues = {
  searchTerm: '',
  topic: '',
  host: '',
  participant: '',
  meetingId: '',
  startDateFrom: '',
};

export const MEETING_LIST_PAGE_SIZE = 50;
