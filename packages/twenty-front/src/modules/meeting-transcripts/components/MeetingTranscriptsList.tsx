import { MeetingTranscriptsListItem } from '@/meeting-transcripts/components/MeetingTranscriptsListItem';
import { type MeetingRecord } from '@/meeting-transcripts/types/meeting-transcripts.types';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type MeetingTranscriptsListProps = {
  meetings: ObjectRecord[];
  loading: boolean;
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

export const MeetingTranscriptsList = ({
  meetings,
  loading,
  selectedMeetingId,
  onSelectMeeting,
}: MeetingTranscriptsListProps) => {
  const { t } = useLingui();

  if (loading && meetings.length === 0) {
    return (
      <StyledListContainer>
        <StyledLoadingContainer>{t`Loading meetings...`}</StyledLoadingContainer>
      </StyledListContainer>
    );
  }

  if (meetings.length === 0) {
    return (
      <StyledListContainer>
        <StyledEmptyContainer>
          {t`No meetings found`}
        </StyledEmptyContainer>
      </StyledListContainer>
    );
  }

  return (
    <StyledListContainer>
      {meetings.map((meeting) => {
        const meetingRecord = meeting as unknown as MeetingRecord;

        return (
          <MeetingTranscriptsListItem
            key={meetingRecord.id}
            meetingName={meetingRecord.name}
            meetingId={meetingRecord.firefliesMeetingId}
            meetingDate={meetingRecord.meetingDate}
            isSelected={meetingRecord.id === selectedMeetingId}
            onClick={() => onSelectMeeting(meetingRecord.id)}
          />
        );
      })}
    </StyledListContainer>
  );
};
