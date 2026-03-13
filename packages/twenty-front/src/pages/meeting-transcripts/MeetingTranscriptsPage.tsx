import { MeetingTranscriptsBody } from '@/meeting-transcripts/components/MeetingTranscriptsBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useState } from 'react';
import { IconVideo } from 'twenty-ui/display';

export const MeetingTranscriptsPage = () => {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(
    null,
  );

  return (
    <PageContainer>
      <PageHeader title="Meeting Transcripts" Icon={IconVideo} />
      <MeetingTranscriptsBody
        selectedMeetingId={selectedMeetingId}
        onSelectMeeting={setSelectedMeetingId}
      />
    </PageContainer>
  );
};
