import {
  MEETING_LIST_GQL_FIELDS,
  MEETING_LIST_PAGE_SIZE,
} from '@/meeting-transcripts/constants/meeting-transcripts-fields.constants';
import { useMeetingObjectExists } from '@/meeting-transcripts/hooks/useMeetingObjectExists';
import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { buildMeetingFilter } from '@/meeting-transcripts/utils/build-meeting-filter.util';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useMeetingTranscriptsList = (
  filterValues: MeetingFilterValues,
) => {
  const { exists: meetingObjectExists } = useMeetingObjectExists();
  const filter = buildMeetingFilter(filterValues);

  const { records, loading, error, fetchMoreRecords, hasNextPage, totalCount } =
    useFindManyRecords({
      objectNameSingular: 'meeting',
      filter,
      orderBy: [{ meetingDate: 'DescNullsLast' }],
      recordGqlFields: MEETING_LIST_GQL_FIELDS,
      limit: MEETING_LIST_PAGE_SIZE,
      skip: !meetingObjectExists,
    });

  return {
    meetings: records,
    loading: loading || !meetingObjectExists,
    error,
    meetingObjectExists,
    fetchMoreRecords,
    hasNextPage,
    totalCount,
  };
};
