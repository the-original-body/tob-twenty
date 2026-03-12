import { MeetingTranscriptsTranscriptRenderer } from '@/meeting-transcripts/components/MeetingTranscriptsTranscriptRenderer';
import { type MeetingTranscriptRecord } from '@/meeting-transcripts/types/meeting-transcripts.types';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

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
  const { t } = useLingui();

  return (
    <StyledDetailContainer>
      {/* Meeting Info */}
      <StyledSection>
        <StyledMeetingTitle>
          {meeting.name || t`Untitled Meeting`}
        </StyledMeetingTitle>
        <StyledInfoGrid>
          <StyledInfoLabel>{t`Meeting ID`}</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.meetingUUID || (
              <StyledEmptyText>{t`Not available`}</StyledEmptyText>
            )}
          </StyledInfoValue>

          <StyledInfoLabel>{t`Start`}</StyledInfoLabel>
          <StyledInfoValue>{formatDateTime(meeting.startTime)}</StyledInfoValue>

          <StyledInfoLabel>{t`End`}</StyledInfoLabel>
          <StyledInfoValue>{formatDateTime(meeting.endTime)}</StyledInfoValue>

          <StyledInfoLabel>{t`Duration`}</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.duration || (
              <StyledEmptyText>{t`Unknown`}</StyledEmptyText>
            )}
          </StyledInfoValue>

          <StyledInfoLabel>{t`Host`}</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.hostEmail || (
              <StyledEmptyText>{t`Not available`}</StyledEmptyText>
            )}
          </StyledInfoValue>

          {meeting.meetingTopic && (
            <>
              <StyledInfoLabel>{t`Topic`}</StyledInfoLabel>
              <StyledInfoValue>{meeting.meetingTopic}</StyledInfoValue>
            </>
          )}
        </StyledInfoGrid>
      </StyledSection>

      {/* Participants */}
      <StyledSection>
        <StyledSectionTitle>{t`Participants`}</StyledSectionTitle>
        <StyledParticipantsList>
          {meeting.participants || (
            <StyledEmptyText>{t`No participants available`}</StyledEmptyText>
          )}
        </StyledParticipantsList>
      </StyledSection>

      {/* English Summary */}
      <StyledSection>
        <StyledSectionTitle>{t`Summary (EN)`}</StyledSectionTitle>
        <StyledSummaryText>
          {meeting.summaryEN || (
            <StyledEmptyText>{t`No summary available`}</StyledEmptyText>
          )}
        </StyledSummaryText>
      </StyledSection>

      {/* German Summary */}
      <StyledSection>
        <StyledSectionTitle>{t`Summary (DE)`}</StyledSectionTitle>
        <StyledSummaryText>
          {meeting.summaryDE || (
            <StyledEmptyText>{t`No summary available`}</StyledEmptyText>
          )}
        </StyledSummaryText>
      </StyledSection>

      {/* Full Transcript */}
      <StyledSection>
        <StyledSectionTitle>{t`Full Transcript`}</StyledSectionTitle>
        <MeetingTranscriptsTranscriptRenderer transcript={meeting.transcript} />
      </StyledSection>
    </StyledDetailContainer>
  );
};
