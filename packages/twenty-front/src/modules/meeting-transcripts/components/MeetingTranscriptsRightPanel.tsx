import { MeetingTranscriptsDetail } from '@/meeting-transcripts/components/MeetingTranscriptsDetail';
import { MeetingTranscriptsEmptyDetail } from '@/meeting-transcripts/components/MeetingTranscriptsEmptyDetail';
import { useMeetingTranscriptDetail } from '@/meeting-transcripts/hooks/useMeetingTranscriptDetail';
import { type MeetingTranscriptRecord } from '@/meeting-transcripts/types/meeting-transcripts.types';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type MeetingTranscriptsRightPanelProps = {
  selectedMeetingId: string | null;
};

const StyledRightPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
`;

const StyledErrorContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.red};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const MeetingTranscriptsRightPanel = ({
  selectedMeetingId,
}: MeetingTranscriptsRightPanelProps) => {
  const { t } = useLingui();
  const { meeting, loading, error } =
    useMeetingTranscriptDetail(selectedMeetingId);

  if (!isDefined(selectedMeetingId)) {
    return (
      <StyledRightPanel>
        <MeetingTranscriptsEmptyDetail />
      </StyledRightPanel>
    );
  }

  if (loading) {
    return (
      <StyledRightPanel>
        <StyledLoadingContainer>
          {t`Loading meeting details...`}
        </StyledLoadingContainer>
      </StyledRightPanel>
    );
  }

  if (error) {
    return (
      <StyledRightPanel>
        <StyledErrorContainer>
          {t`Failed to load meeting details. Please try again.`}
        </StyledErrorContainer>
      </StyledRightPanel>
    );
  }

  if (!meeting) {
    return (
      <StyledRightPanel>
        <MeetingTranscriptsEmptyDetail />
      </StyledRightPanel>
    );
  }

  const meetingRecord = meeting as unknown as MeetingTranscriptRecord;

  return (
    <StyledRightPanel>
      <MeetingTranscriptsDetail meeting={meetingRecord} />
    </StyledRightPanel>
  );
};
