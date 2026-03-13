import { MeetingTranscriptsCollapsibleSection } from '@/meeting-transcripts/components/MeetingTranscriptsCollapsibleSection';
import { MeetingTranscriptsParticipantCard } from '@/meeting-transcripts/components/MeetingTranscriptsParticipantCard';
import { MeetingTranscriptsTranscriptRenderer } from '@/meeting-transcripts/components/MeetingTranscriptsTranscriptRenderer';
import { type MeetingTranscriptRecord } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { parseParticipants } from '@/meeting-transcripts/utils/parse-participants.util';
import styled from '@emotion/styled';
import { IconCopy } from 'twenty-ui/display';
import { isDefined } from 'twenty-shared/utils';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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

const StyledParticipantsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
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

const StyledCopyButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    color: ${({ theme }) => theme.font.color.primary};
  }
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

const buildMeetingInfoText = (meeting: MeetingTranscriptRecord): string => {
  const lines = [
    `Meeting ID: ${meeting.meetingUuid || 'N/A'}`,
    `Start: ${formatDateTime(meeting.meetingStartTime)}`,
    `End: ${formatDateTime(meeting.meetingEndTime)}`,
    `Duration: ${meeting.meetingDuration || 'Unknown'}`,
    `Host: ${meeting.hostEmail || 'N/A'}`,
  ];

  if (isDefined(meeting.meetingTopic)) {
    lines.push(`Topic: ${meeting.meetingTopic}`);
  }

  return lines.join('\n');
};

export const MeetingTranscriptsDetail = ({
  meeting,
}: MeetingTranscriptsDetailProps) => {
  const { copyToClipboard } = useCopyToClipboard();
  const parsedParticipants = parseParticipants(meeting.participants);
  const participantCountLabel = isDefined(meeting.participantCount)
    ? ` (${meeting.participantCount})`
    : parsedParticipants.length > 0
      ? ` (${parsedParticipants.length})`
      : '';

  const renderCopyButton = (content: string | null, message: string) => {
    if (!isDefined(content) || content.trim().length === 0) {
      return undefined;
    }

    return (
      <StyledCopyButton onClick={() => copyToClipboard(content, message)}>
        <IconCopy size={14} />
      </StyledCopyButton>
    );
  };

  return (
    <StyledDetailContainer>
      <StyledMeetingTitle>
        {meeting.name || 'Untitled Meeting'}
      </StyledMeetingTitle>

      <MeetingTranscriptsCollapsibleSection
        title="Meeting Info"
        isInitiallyExpanded={true}
        rightElement={renderCopyButton(
          buildMeetingInfoText(meeting),
          'Meeting info copied',
        )}
      >
        <StyledInfoGrid>
          <StyledInfoLabel>Meeting ID</StyledInfoLabel>
          <StyledInfoValue>
            {meeting.meetingUuid || (
              <StyledEmptyText>Not available</StyledEmptyText>
            )}
          </StyledInfoValue>

          <StyledInfoLabel>Start</StyledInfoLabel>
          <StyledInfoValue>
            {formatDateTime(meeting.meetingStartTime)}
          </StyledInfoValue>

          <StyledInfoLabel>End</StyledInfoLabel>
          <StyledInfoValue>
            {formatDateTime(meeting.meetingEndTime)}
          </StyledInfoValue>

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
      </MeetingTranscriptsCollapsibleSection>

      <MeetingTranscriptsCollapsibleSection
        title={`Participants${participantCountLabel}`}
        isInitiallyExpanded={true}
        rightElement={renderCopyButton(
          meeting.participants,
          'Participants copied',
        )}
      >
        {parsedParticipants.length > 0 ? (
          <StyledParticipantsGrid>
            {parsedParticipants.map((participant, index) => (
              <MeetingTranscriptsParticipantCard
                key={`${participant.name}-${index}`}
                participant={participant}
              />
            ))}
          </StyledParticipantsGrid>
        ) : (
          <StyledEmptyText>No participants available</StyledEmptyText>
        )}
      </MeetingTranscriptsCollapsibleSection>

      <MeetingTranscriptsCollapsibleSection
        title="Summary (EN)"
        isInitiallyExpanded={true}
        rightElement={renderCopyButton(meeting.summaryEng, 'Summary copied')}
      >
        <StyledSummaryText>
          {meeting.summaryEng || (
            <StyledEmptyText>No summary available</StyledEmptyText>
          )}
        </StyledSummaryText>
      </MeetingTranscriptsCollapsibleSection>

      <MeetingTranscriptsCollapsibleSection
        title="Summary (DE)"
        isInitiallyExpanded={false}
        rightElement={renderCopyButton(
          meeting.zusammenfassung,
          'Summary copied',
        )}
      >
        <StyledSummaryText>
          {meeting.zusammenfassung || (
            <StyledEmptyText>No summary available</StyledEmptyText>
          )}
        </StyledSummaryText>
      </MeetingTranscriptsCollapsibleSection>

      <MeetingTranscriptsCollapsibleSection
        title="Full Transcript"
        isInitiallyExpanded={false}
        rightElement={renderCopyButton(
          meeting.transcriptText,
          'Transcript copied',
        )}
      >
        <MeetingTranscriptsTranscriptRenderer
          transcript={meeting.transcriptText}
        />
      </MeetingTranscriptsCollapsibleSection>
    </StyledDetailContainer>
  );
};
