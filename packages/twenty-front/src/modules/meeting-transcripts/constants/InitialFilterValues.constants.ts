import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';

export const INITIAL_FILTER_VALUES: MeetingFilterValues = {
  searchTerm: '',
  topic: '',
  host: '',
  participant: '',
  meetingId: '',
  startDateFrom: '',
};
