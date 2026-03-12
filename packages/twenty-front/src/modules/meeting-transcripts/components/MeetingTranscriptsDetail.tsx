import { MeetingTranscriptsTranscriptRenderer } from '@/meeting-transcripts/components/MeetingTranscriptsTranscriptRenderer';
import { type MeetingRecord } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { extractParticipants } from '@/meeting-transcripts/utils/parse-transcript.util';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';

type MeetingTranscriptsDetailProps = {
  meeting: MeetingRecord;
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

const formatDuration = (minutes: number | null): string => {
  if (minutes === null || minutes === undefined) {
    return 'Unknown';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  return `${remainingMinutes}m`;
};

const calculateEndTime = (
  startDate: string | null,
  durationMinutes: number | null,
): string => {
  if (!startDate || durationMinutes === null || durationMinutes === undefined) {
    return 'Unknown';
  }

  try {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    return end.toLocaleString('en-GB', {
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

  const participants = useMemo(
    () => extractParticipants(meeting.transcript ?? ''),
    [meeting.transcript],
  );

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
            {meeting.firefliesMeetingId || (
              <StyledEmptyText>{t`Not available`}</StyledEmptyText>
            )}
          </StyledInfoValue>

          <StyledInfoLabel>{t`Start`}</StyledInfoLabel>
          <StyledInfoValue>
            {formatDateTime(meeting.meetingDate)}
          </StyledInfoValue>

          <StyledInfoLabel>{t`End`}</StyledInfoLabel>
          <StyledInfoValue>
            {calculateEndTime(meeting.meetingDate, meeting.duration)}
          </StyledInfoValue>

          <StyledInfoLabel>{t`Duration`}</StyledInfoLabel>
          <StyledInfoValue>{formatDuration(meeting.duration)}</StyledInfoValue>

          <StyledInfoLabel>{t`Host`}</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.organizerEmail || (
              <StyledEmptyText>{t`Not available`}</StyledEmptyText>
            )}
          </StyledInfoValue>
        </StyledInfoGrid>
      </StyledSection>

      {/* Participants */}
      <StyledSection>
        <StyledSectionTitle>{t`Participants`}</StyledSectionTitle>
        <StyledParticipantsList>
          {participants.length > 0 ? (
            participants.join(', ')
          ) : (
            <StyledEmptyText>
              {t`No participants detected in transcript`}
            </StyledEmptyText>
          )}
        </StyledParticipantsList>
      </StyledSection>

      {/* English Summary */}
      <StyledSection>
        <StyledSectionTitle>{t`Summary (EN)`}</StyledSectionTitle>
        <StyledSummaryText>
          {meeting.overview || (
            <StyledEmptyText>{t`No summary available`}</StyledEmptyText>
          )}
        </StyledSummaryText>
      </StyledSection>

      {/* German Summary */}
      <StyledSection>
        <StyledSectionTitle>{t`Summary (DE)`}</StyledSectionTitle>
        <StyledSummaryText>
          {meeting.notes || (
            <StyledEmptyText>{t`No summary available`}</StyledEmptyText>
          )}
        </StyledSummaryText>
      </StyledSection>

      {/* Full Transcript */}
      <StyledSection>
        <StyledSectionTitle>{t`Full Transcript`}</StyledSectionTitle>
        <MeetingTranscriptsTranscriptRenderer
          transcript={meeting.transcript}
        />
      </StyledSection>
    </StyledDetailContainer>
  );
};
