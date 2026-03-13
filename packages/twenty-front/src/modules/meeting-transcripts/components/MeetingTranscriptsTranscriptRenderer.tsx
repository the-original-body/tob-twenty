import { parseTranscriptSegments } from '@/meeting-transcripts/utils/parse-transcript.util';
import styled from '@emotion/styled';

type MeetingTranscriptsTranscriptRendererProps = {
  transcript: string | null;
};

const StyledTranscriptContainer = styled.div`
  line-height: 1.6;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledSpeaker = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledTimestamp = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-family: monospace;
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledSegmentBlock = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyMessage = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

export const MeetingTranscriptsTranscriptRenderer = ({
  transcript,
}: MeetingTranscriptsTranscriptRendererProps) => {
  if (!transcript || transcript.trim().length === 0) {
    return (
      <StyledEmptyMessage>No transcript available</StyledEmptyMessage>
    );
  }

  const segments = parseTranscriptSegments(transcript);

  if (segments.length === 0) {
    return (
      <StyledEmptyMessage>No transcript available</StyledEmptyMessage>
    );
  }

  // If just a single unstructured text block, render as pre-wrapped text
  if (segments.length === 1 && segments[0].type === 'text') {
    return (
      <StyledTranscriptContainer>
        <StyledText>{segments[0].content}</StyledText>
      </StyledTranscriptContainer>
    );
  }

  return (
    <StyledTranscriptContainer>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'speaker':
            return (
              <StyledSegmentBlock key={index}>
                <StyledSpeaker>{segment.content}: </StyledSpeaker>
              </StyledSegmentBlock>
            );
          case 'timestamp':
            return (
              <StyledTimestamp key={index}>[{segment.content}]</StyledTimestamp>
            );
          case 'text':
            return <StyledText key={index}>{segment.content} </StyledText>;
          default:
            return null;
        }
      })}
    </StyledTranscriptContainer>
  );
};
