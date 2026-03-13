import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

export const MEETING_LIST_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  meetingUuid: true,
  meetingStartTime: true,
  meetingDuration: true,
  meetingTopic: true,
  hostEmail: true,
};
