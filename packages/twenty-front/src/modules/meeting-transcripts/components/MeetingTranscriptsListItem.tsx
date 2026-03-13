import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type MeetingTranscriptsListItemProps = {
  meetingName: string;
  meetingId: string | null;
  meetingDate: string | null;
  meetingTopic: string | null;
  hostEmail: string | null;
  isSelected: boolean;
  onClick: () => void;
};

const StyledListItem = styled.div<{ isSelected: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : 'transparent'};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  transition:
    background 0.1s ease,
    border-color 0.1s ease;

  &:hover {
    background: ${({ theme, isSelected }) =>
      isSelected
        ? theme.background.tertiary
        : theme.background.transparent.light};
  }
`;

const StyledMeetingName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMetaRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const formatMeetingDate = (dateString: string | null): string | null => {
  if (!isDefined(dateString)) {
    return null;
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
    return null;
  }
};

export const MeetingTranscriptsListItem = ({
  meetingName,
  meetingId,
  meetingDate,
  meetingTopic,
  hostEmail,
  isSelected,
  onClick,
}: MeetingTranscriptsListItemProps) => {
  const formattedDate = formatMeetingDate(meetingDate);
  const hasExtraInfo = isDefined(meetingTopic) || isDefined(hostEmail);

  return (
    <StyledListItem isSelected={isSelected} onClick={onClick}>
      <StyledMeetingName>{meetingName || 'Untitled Meeting'}</StyledMeetingName>
      <StyledMetaRow>
        <span>{formattedDate ?? 'Date unknown'}</span>
        {isDefined(meetingId) && <span>{meetingId}</span>}
      </StyledMetaRow>
      {hasExtraInfo && (
        <StyledMetaRow>
          {isDefined(meetingTopic) && <span>{meetingTopic}</span>}
          {isDefined(hostEmail) && <span>{hostEmail}</span>}
        </StyledMetaRow>
      )}
    </StyledListItem>
  );
};
