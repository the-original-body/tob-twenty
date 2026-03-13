import { MeetingTranscriptsTranscriptRenderer } from '@/meeting-transcripts/components/MeetingTranscriptsTranscriptRenderer';
import { type MeetingTranscriptRecord } from '@/meeting-transcripts/types/meeting-transcripts.types';
import styled from '@emotion/styled';

type MeetingTranscriptsDetailProps = {
  meeting: MeetingTranscriptRecord;
};

const StyledDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSection = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const StyledSectionTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledMeetingTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledInfoGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: auto 1fr;
`;

const StyledInfoLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledParticipantsList = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.6;
`;

const StyledSummaryText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const StyledEmptyText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
`;

const formatDateTime = (dateString: string | null): string => {
  if (!dateString) {
    return 'Unknown';
  }

  try {
    const date = new Date(dateString);

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
};

export const MeetingTranscriptsDetail = ({
  meeting,
}: MeetingTranscriptsDetailProps) => {
  return (
    <StyledDetailContainer>
      <StyledSection>
        <StyledMeetingTitle>
          {meeting.name || 'Untitled Meeting'}
        </StyledMeetingTitle>
        <StyledInfoGrid>
          <StyledInfoLabel>Meeting ID</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.meetingUuid || (
              <StyledEmptyText>Not available</StyledEmptyText>
            )}
          </StyledInfoValue>

          <StyledInfoLabel>Start</StyledInfoLabel>
          <StyledInfoValue>{formatDateTime(meeting.meetingStartTime)}</StyledInfoValue>

          <StyledInfoLabel>End</StyledInfoLabel>
          <StyledInfoValue>{formatDateTime(meeting.meetingEndTime)}</StyledInfoValue>

          <StyledInfoLabel>Duration</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.meetingDuration || (
              <StyledEmptyText>Unknown</StyledEmptyText>
            )}
          </StyledInfoValue>

          <StyledInfoLabel>Host</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.hostEmail || (
              <StyledEmptyText>Not available</StyledEmptyText>
            )}
          </StyledInfoValue>

          {meeting.meetingTopic && (
            <>
              <StyledInfoLabel>Topic</StyledInfoLabel>
              <StyledInfoValue>{meeting.meetingTopic}</StyledInfoValue>
            </>
          )}
        </StyledInfoGrid>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Participants</StyledSectionTitle>
        <StyledParticipantsList>
          {meeting.participants || (
            <StyledEmptyText>No participants available</StyledEmptyText>
          )}
        </StyledParticipantsList>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Summary (EN)</StyledSectionTitle>
        <StyledSummaryText>
          {meeting.summaryEng || (
            <StyledEmptyText>No summary available</StyledEmptyText>
          )}
        </StyledSummaryText>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Summary (DE)</StyledSectionTitle>
        <StyledSummaryText>
          {meeting.zusammenfassung || (
            <StyledEmptyText>No summary available</StyledEmptyText>
          )}
        </StyledSummaryText>
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Full Transcript</StyledSectionTitle>
        <MeetingTranscriptsTranscriptRenderer transcript={meeting.transcriptText} />
      </StyledSection>
    </StyledDetailContainer>
  );
};
