import { MeetingTranscriptsLeftPanel } from '@/meeting-transcripts/components/MeetingTranscriptsLeftPanel';
import { MeetingTranscriptsRightPanel } from '@/meeting-transcripts/components/MeetingTranscriptsRightPanel';
import { INITIAL_FILTER_VALUES } from '@/meeting-transcripts/constants/meeting-transcripts-fields.constants';
import { useMeetingObjectExists } from '@/meeting-transcripts/hooks/useMeetingObjectExists';
import { useMeetingTranscriptsList } from '@/meeting-transcripts/hooks/useMeetingTranscriptsList';
import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { IconAlertTriangle } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';

type MeetingTranscriptsBodyProps = {
  selectedMeetingId: string | null;
  onSelectMeeting: (meetingId: string) => void;
};

const StyledBodyContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
`;

const StyledMessageContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

const StyledMessageIcon = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledMessageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledMessageText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  max-width: 400px;
  text-align: center;
`;

// Inner component that calls the data hooks — only rendered when meeting object exists
const MeetingTranscriptsBodyContent = ({
  selectedMeetingId,
  onSelectMeeting,
}: MeetingTranscriptsBodyProps) => {
  const [filterValues, setFilterValues] =
    useState<MeetingFilterValues>(INITIAL_FILTER_VALUES);

  const [queryFilterValues, setQueryFilterValues] =
    useState<MeetingFilterValues>(INITIAL_FILTER_VALUES);

  const debouncedUpdate = useDebouncedCallback(
    (values: MeetingFilterValues) => {
      setQueryFilterValues(values);
    },
    300,
  );

  const handleFilterChange = useCallback(
    (values: MeetingFilterValues) => {
      setFilterValues(values);
      debouncedUpdate(values);
    },
    [debouncedUpdate],
  );

  const { meetings, loading } = useMeetingTranscriptsList(queryFilterValues);

  return (
    <StyledBodyContainer>
      <MeetingTranscriptsLeftPanel
        meetings={meetings}
        loading={loading}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        selectedMeetingId={selectedMeetingId}
        onSelectMeeting={onSelectMeeting}
      />
      <MeetingTranscriptsRightPanel selectedMeetingId={selectedMeetingId} />
    </StyledBodyContainer>
  );
};

// Gate component — checks if meeting object exists before rendering content
export const MeetingTranscriptsBody = ({
  selectedMeetingId,
  onSelectMeeting,
}: MeetingTranscriptsBodyProps) => {
  const { t } = useLingui();
  const { exists, isLoading } = useMeetingObjectExists();

  if (isLoading) {
    return (
      <StyledMessageContainer>
        <StyledMessageText>{t`Loading...`}</StyledMessageText>
      </StyledMessageContainer>
    );
  }

  if (!exists) {
    return (
      <StyledMessageContainer>
        <StyledMessageIcon>
          <IconAlertTriangle size={48} />
        </StyledMessageIcon>
        <StyledMessageTitle>
          {t`Meeting object not found`}
        </StyledMessageTitle>
        <StyledMessageText>
          {t`The Meeting object has not been set up in this workspace. Please contact your administrator to create the Meeting object and sync meeting data.`}
        </StyledMessageText>
      </StyledMessageContainer>
    );
  }

  return (
    <MeetingTranscriptsBodyContent
      selectedMeetingId={selectedMeetingId}
      onSelectMeeting={onSelectMeeting}
    />
  );
};
