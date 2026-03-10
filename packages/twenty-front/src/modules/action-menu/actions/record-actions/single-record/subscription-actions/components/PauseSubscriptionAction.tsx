import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';

export const PauseSubscriptionAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { objectMetadataItem } = useRecordIndexIdFromCurrentContextStore();
  const { t } = useLingui();

  const { record } = useFindOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: recordId,
  });

  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueDialog } = useDialogManager();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const handleClick = () => {
    if (!record) {
      return;
    }

    const accessStatus = record.accessStatus;
    if (accessStatus === 'WITHDRAWN') {
      enqueueErrorSnackBar({
        message: t`Cannot pause a withdrawn subscription`,
      });
      return;
    }

    const currentEndDate = record.endDate
      ? new Date(record.endDate as string)
      : null;
    const pauseDurationWeeks = 4;
    const pauseDurationMs = pauseDurationWeeks * 7 * 24 * 60 * 60 * 1000;
    const newEndDate = currentEndDate
      ? new Date(currentEndDate.getTime() + pauseDurationMs)
      : null;

    const currentEndDateStr = currentEndDate
      ? currentEndDate.toLocaleDateString()
      : t`Not set`;
    const newEndDateStr = newEndDate
      ? newEndDate.toLocaleDateString()
      : t`Cannot calculate`;

    enqueueDialog({
      title: t`Pause Subscription`,
      message: t`This will pause the subscription for ${pauseDurationWeeks} weeks.\n\nCurrent end date: ${currentEndDateStr}\nNew end date: ${newEndDateStr}\n\nAccess status will be set to "Paused".`,
      buttons: [
        {
          title: t`Cancel`,
          variant: 'secondary',
        },
        {
          title: t`Confirm Pause`,
          variant: 'primary',
          accent: 'blue',
          role: 'confirm',
          onClick: async () => {
            try {
              await updateOneRecord({
                objectNameSingular: objectMetadataItem.nameSingular,
                idToUpdate: recordId,
                updateOneRecordInput: {
                  ...(newEndDate && {
                    endDate: newEndDate.toISOString(),
                  }),
                  accessStatus: 'PAUSED',
                },
              });

              enqueueSuccessSnackBar({
                message: t`Subscription paused for ${pauseDurationWeeks} weeks`,
              });
            } catch {
              enqueueErrorSnackBar({
                message: t`Failed to pause subscription`,
              });
            }
          },
        },
      ],
    });
  };

  return <Action onClick={handleClick} />;
};
