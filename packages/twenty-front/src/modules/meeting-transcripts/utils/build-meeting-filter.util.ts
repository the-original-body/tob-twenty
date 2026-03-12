import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export const buildMeetingFilter = (
  filterValues: MeetingFilterValues,
): RecordGqlOperationFilter | undefined => {
  const clauses: RecordGqlOperationFilter[] = [];

  // Global search — searches across name, transcript, organizer email, and meeting ID
  if (filterValues.searchTerm) {
    clauses.push({
      or: [
        { name: { ilike: `%${filterValues.searchTerm}%` } },
        { transcript: { ilike: `%${filterValues.searchTerm}%` } },
        { organizerEmail: { ilike: `%${filterValues.searchTerm}%` } },
        { firefliesMeetingId: { ilike: `%${filterValues.searchTerm}%` } },
      ],
    });
  }

  // Topic filter — searches meeting name
  if (filterValues.topic) {
    clauses.push({
      name: { ilike: `%${filterValues.topic}%` },
    });
  }

  // Host filter — searches organizer email
  if (filterValues.host) {
    clauses.push({
      organizerEmail: { ilike: `%${filterValues.host}%` },
    });
  }

  // Participant filter — searches within transcript text for speaker names
  if (filterValues.participant) {
    clauses.push({
      transcript: { ilike: `%${filterValues.participant}%` },
    });
  }

  // Meeting ID filter — partial match on fireflies meeting ID
  if (filterValues.meetingId) {
    clauses.push({
      firefliesMeetingId: { ilike: `%${filterValues.meetingId}%` },
    });
  }

  // Start date filter — meetings on or after this date
  if (filterValues.startDateFrom) {
    clauses.push({
      meetingDate: { gte: filterValues.startDateFrom },
    });
  }

  if (clauses.length === 0) {
    return undefined;
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return { and: clauses };
};
