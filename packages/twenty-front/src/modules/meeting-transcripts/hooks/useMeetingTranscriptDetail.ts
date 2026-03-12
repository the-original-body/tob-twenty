import { MEETING_DETAIL_GQL_FIELDS } from '@/meeting-transcripts/constants/meeting-transcripts-fields.constants';
import { useMeetingObjectExists } from '@/meeting-transcripts/hooks/useMeetingObjectExists';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

export const useMeetingTranscriptDetail = (meetingId: string | null) => {
  const { exists: meetingObjectExists } = useMeetingObjectExists();

  const { record, loading, error } = useFindOneRecord({
    objectNameSingular: 'meeting',
    objectRecordId: meetingId ?? '',
    recordGqlFields: MEETING_DETAIL_GQL_FIELDS,
    skip: !meetingId || !meetingObjectExists,
  });

  return {
    meeting: record,
    loading,
    error,
    meetingObjectExists,
  };
};
