import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

export const MEETING_DETAIL_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  meetingUuid: true,
  meetingStartTime: true,
  meetingEndTime: true,
  meetingDuration: true,
  hostEmail: true,
  participants: true,
  transcriptText: true,
  zusammenfassung: true,
  summaryEng: true,
  zusammenfassungLang: true,
  meetingTopic: true,
  participantCount: true,
  speakerCount: true,
};
