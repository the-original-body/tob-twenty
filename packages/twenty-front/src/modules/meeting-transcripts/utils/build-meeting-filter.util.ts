import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export const buildMeetingFilter = (
  filterValues: MeetingFilterValues,
): RecordGqlOperationFilter | undefined => {
  const clauses: RecordGqlOperationFilter[] = [];

  if (filterValues.searchTerm) {
    clauses.push({
      or: [
        { name: { ilike: `%${filterValues.searchTerm}%` } },
        { transcriptText: { ilike: `%${filterValues.searchTerm}%` } },
        { hostEmail: { ilike: `%${filterValues.searchTerm}%` } },
        { meetingUuid: { ilike: `%${filterValues.searchTerm}%` } },
        { participants: { ilike: `%${filterValues.searchTerm}%` } },
      ],
    });
  }

  if (filterValues.topic) {
    clauses.push({
      or: [
        { name: { ilike: `%${filterValues.topic}%` } },
        { meetingTopic: { ilike: `%${filterValues.topic}%` } },
      ],
    });
  }

  if (filterValues.host) {
    clauses.push({
      hostEmail: { ilike: `%${filterValues.host}%` },
    });
  }

  if (filterValues.participant) {
    clauses.push({
      participants: { ilike: `%${filterValues.participant}%` },
    });
  }

  if (filterValues.meetingId) {
    clauses.push({
      meetingUuid: { ilike: `%${filterValues.meetingId}%` },
    });
  }

  if (filterValues.startDateFrom) {
    clauses.push({
      meetingStartTime: { gte: filterValues.startDateFrom },
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
