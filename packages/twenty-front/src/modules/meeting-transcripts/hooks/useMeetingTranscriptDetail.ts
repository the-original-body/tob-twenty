import { MEETING_DETAIL_GQL_FIELDS } from '@/meeting-transcripts/constants/MeetingDetailGqlFields.constants';
import { MEETING_OBJECT_NAME_SINGULAR } from '@/meeting-transcripts/constants/MeetingObjectNameSingular.constants';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

export const useMeetingTranscriptDetail = (meetingId: string | null) => {
  const { record, loading, error } = useFindOneRecord({
    objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
    objectRecordId: meetingId ?? '',
    recordGqlFields: MEETING_DETAIL_GQL_FIELDS,
    skip: !meetingId,
  });

  return {
    meeting: record,
    loading,
    error,
  };
};
