import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

export const MEETING_DETAIL_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  meetingUUID: true,
  startTime: true,
  endTime: true,
  duration: true,
  hostEmail: true,
  participants: true,
  transcript: true,
  summaryDE: true,
  summaryEN: true,
  executiveSummary: true,
  meetingTopic: true,
  participantCount: true,
  speakerCount: true,
};
