import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type MeetingTranscriptsListItemProps = {
  meetingName: string;
  meetingId: string | null;
  meetingDate: string | null;
  isSelected: boolean;
  onClick: () => void;
};

const StyledListItem = styled.div<{ isSelected: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : 'transparent'};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(3)};
  transition: background 0.1s ease;

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
`;

const formatMeetingDate = (dateString: string | null): string | null => {
  if (!isDefined(dateString)) {
    return null;
  }

  try {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
};

export const MeetingTranscriptsListItem = ({
  meetingName,
  meetingId,
  meetingDate,
  isSelected,
  onClick,
}: MeetingTranscriptsListItemProps) => {
  const formattedDate = formatMeetingDate(meetingDate);

  return (
    <StyledListItem isSelected={isSelected} onClick={onClick}>
      <StyledMeetingName>
        {meetingName || 'Untitled Meeting'}
      </StyledMeetingName>
      <StyledMetaRow>
        {isDefined(meetingId) && <span>{meetingId}</span>}
        <span>{formattedDate ?? 'Date unknown'}</span>
      </StyledMetaRow>
    </StyledListItem>
  );
};
