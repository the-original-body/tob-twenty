import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';

export const MEETING_LIST_GQL_FIELDS: RecordGqlOperationGqlRecordFields = {
  id: true,
  name: true,
  createdAt: true,
  meetingUUID: true,
  startTime: true,
  duration: true,
  hostEmail: true,
};
