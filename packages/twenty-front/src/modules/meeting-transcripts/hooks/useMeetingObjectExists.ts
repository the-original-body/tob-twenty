import { MEETING_OBJECT_NAME_SINGULAR } from '@/meeting-transcripts/constants/MeetingObjectNameSingular.constants';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isDefined } from 'twenty-shared/utils';

export const useMeetingObjectExists = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const meetingMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === MEETING_OBJECT_NAME_SINGULAR,
  );

  return {
    exists: isDefined(meetingMetadata),
    isLoading: objectMetadataItems.length === 0,
  };
};
