import { type ParsedParticipant } from '@/meeting-transcripts/utils/parse-participants.util';
import styled from '@emotion/styled';
import { IconUser } from 'twenty-ui/display';

type MeetingTranscriptsParticipantCardProps = {
  participant: ParsedParticipant;
};

const StyledCard = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: nowrap;
`;

const StyledTeam = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  white-space: nowrap;
`;

export const MeetingTranscriptsParticipantCard = ({
  participant,
}: MeetingTranscriptsParticipantCardProps) => {
  return (
    <StyledCard>
      <StyledIcon>
        <IconUser size={14} />
      </StyledIcon>
      <StyledName>{participant.name}</StyledName>
      {participant.team && <StyledTeam>{participant.team}</StyledTeam>}
    </StyledCard>
  );
};
