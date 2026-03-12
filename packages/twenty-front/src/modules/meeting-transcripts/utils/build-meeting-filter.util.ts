import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export const buildMeetingFilter = (
  filterValues: MeetingFilterValues,
): RecordGqlOperationFilter | undefined => {
  const clauses: RecordGqlOperationFilter[] = [];

  // Global search — searches across name, transcript, host email, and meeting UUID
  if (filterValues.searchTerm) {
    clauses.push({
      or: [
        { name: { ilike: `%${filterValues.searchTerm}%` } },
        { transcript: { ilike: `%${filterValues.searchTerm}%` } },
        { hostEmail: { ilike: `%${filterValues.searchTerm}%` } },
        { meetingUUID: { ilike: `%${filterValues.searchTerm}%` } },
        { participants: { ilike: `%${filterValues.searchTerm}%` } },
      ],
    });
  }

  // Topic filter — searches meeting name and meeting topic
  if (filterValues.topic) {
    clauses.push({
      or: [
        { name: { ilike: `%${filterValues.topic}%` } },
        { meetingTopic: { ilike: `%${filterValues.topic}%` } },
      ],
    });
  }

  // Host filter — searches host email
  if (filterValues.host) {
    clauses.push({
      hostEmail: { ilike: `%${filterValues.host}%` },
    });
  }

  // Participant filter — searches the participants field
  if (filterValues.participant) {
    clauses.push({
      participants: { ilike: `%${filterValues.participant}%` },
    });
  }

  // Meeting ID filter — partial match on meeting UUID
  if (filterValues.meetingId) {
    clauses.push({
      meetingUUID: { ilike: `%${filterValues.meetingId}%` },
    });
  }

  // Start date filter — startTime is stored as text, use ilike for date prefix
  if (filterValues.startDateFrom) {
    clauses.push({
      startTime: { gte: filterValues.startDateFrom },
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
