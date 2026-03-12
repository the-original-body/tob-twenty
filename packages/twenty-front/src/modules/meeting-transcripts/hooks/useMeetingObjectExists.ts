import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isDefined } from 'twenty-shared/utils';

export const useMeetingObjectExists = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const meetingMetadata = objectMetadataItems.find(
    (item) => item.nameSingular === 'meeting',
  );

  return {
    exists: isDefined(meetingMetadata),
    isLoading: objectMetadataItems.length === 0,
  };
};
