import { MeetingTranscriptsListItem } from '@/meeting-transcripts/components/MeetingTranscriptsListItem';
import { type MeetingTranscriptRecord } from '@/meeting-transcripts/types/meeting-transcripts.types';
import styled from '@emotion/styled';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useInView } from 'react-intersection-observer';

type MeetingTranscriptsListProps = {
  meetings: ObjectRecord[];
  loading: boolean;
  fetchMoreRecords: (() => void) | undefined;
  hasNextPage: boolean;
  selectedMeetingId: string | null;
  onSelectMeeting: (meetingId: string) => void;
};

const StyledListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledEmptyContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.md};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledLoadMoreTrigger = styled.div`
  height: 1px;
`;

const StyledLoadingMore = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

export const MeetingTranscriptsList = ({
  meetings,
  loading,
  fetchMoreRecords,
  hasNextPage,
  selectedMeetingId,
  onSelectMeeting,
}: MeetingTranscriptsListProps) => {
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords?.();
      }
    },
  });

  if (loading && meetings.length === 0) {
    return (
      <StyledListContainer>
        <StyledLoadingContainer>{'Loading meetings...'}</StyledLoadingContainer>
      </StyledListContainer>
    );
  }

  if (meetings.length === 0) {
    return (
      <StyledListContainer>
        <StyledEmptyContainer>{'No meetings found'}</StyledEmptyContainer>
      </StyledListContainer>
    );
  }

  return (
    <StyledListContainer>
      {meetings.map((meeting) => {
        const meetingRecord = meeting as unknown as MeetingTranscriptRecord;

        return (
          <MeetingTranscriptsListItem
            key={meetingRecord.id}
            meetingName={meetingRecord.name}
            meetingId={meetingRecord.meetingUuid}
            meetingDate={meetingRecord.meetingStartTime}
            meetingTopic={meetingRecord.meetingTopic}
            hostEmail={meetingRecord.hostEmail}
            isSelected={meetingRecord.id === selectedMeetingId}
            onClick={() => onSelectMeeting(meetingRecord.id)}
          />
        );
      })}
      {hasNextPage && <StyledLoadMoreTrigger ref={ref} />}
      {loading && meetings.length > 0 && (
        <StyledLoadingMore>Loading more...</StyledLoadingMore>
      )}
    </StyledListContainer>
  );
};
