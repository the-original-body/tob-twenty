import { MEETING_LIST_GQL_FIELDS } from '@/meeting-transcripts/constants/MeetingListGqlFields.constants';
import { MEETING_LIST_PAGE_SIZE } from '@/meeting-transcripts/constants/MeetingListPageSize.constants';
import { MEETING_OBJECT_NAME_SINGULAR } from '@/meeting-transcripts/constants/MeetingObjectNameSingular.constants';
import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { buildMeetingFilter } from '@/meeting-transcripts/utils/build-meeting-filter.util';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useMeetingTranscriptsList = (
  filterValues: MeetingFilterValues,
) => {
  const filter = buildMeetingFilter(filterValues);

  // startTime is a Text field, but lexicographic sort works for ISO date strings
  const { records, loading, error, fetchMoreRecords, hasNextPage, totalCount } =
    useFindManyRecords({
      objectNameSingular: MEETING_OBJECT_NAME_SINGULAR,
      filter,
      orderBy: [{ startTime: 'DescNullsLast' }],
      recordGqlFields: MEETING_LIST_GQL_FIELDS,
      limit: MEETING_LIST_PAGE_SIZE,
    });

  return {
    meetings: records,
    loading,
    error,
    fetchMoreRecords,
    hasNextPage,
    totalCount,
  };
};
