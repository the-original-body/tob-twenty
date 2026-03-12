import { MeetingTranscriptsFilterBar } from '@/meeting-transcripts/components/MeetingTranscriptsFilterBar';
import { MeetingTranscriptsList } from '@/meeting-transcripts/components/MeetingTranscriptsList';
import { type MeetingFilterValues } from '@/meeting-transcripts/types/meeting-transcripts.types';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';

type MeetingTranscriptsLeftPanelProps = {
  meetings: ObjectRecord[];
  loading: boolean;
  filterValues: MeetingFilterValues;
  onFilterChange: (values: MeetingFilterValues) => void;
  selectedMeetingId: string | null;
  onSelectMeeting: (meetingId: string) => void;
};

const StyledLeftPanel = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 340px;
  overflow: hidden;
  width: 380px;
`;

export const MeetingTranscriptsLeftPanel = ({
  meetings,
  loading,
  filterValues,
  onFilterChange,
  selectedMeetingId,
  onSelectMeeting,
}: MeetingTranscriptsLeftPanelProps) => {
  return (
    <StyledLeftPanel>
      <MeetingTranscriptsFilterBar
        filterValues={filterValues}
        onFilterChange={onFilterChange}
      />
      <MeetingTranscriptsList
        meetings={meetings}
        loading={loading}
        selectedMeetingId={selectedMeetingId}
        onSelectMeeting={onSelectMeeting}
      />
    </StyledLeftPanel>
  );
};
