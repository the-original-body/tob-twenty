import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';

export const ExtendSubscriptionAction = () => {
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

    const currentEndDate = record.endDate
      ? new Date(record.endDate as string)
      : new Date();
    const extensionMonths = 3;
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + extensionMonths);

    const currentEndDateStr = record.endDate
      ? currentEndDate.toLocaleDateString()
      : t`Not set`;
    const newEndDateStr = newEndDate.toLocaleDateString();

    enqueueDialog({
      title: t`Extend / Renew Subscription`,
      message: t`This will extend the subscription by ${extensionMonths} months.\n\nCurrent end date: ${currentEndDateStr}\nNew end date: ${newEndDateStr}`,
      buttons: [
        {
          title: t`Cancel`,
          variant: 'secondary',
        },
        {
          title: t`Confirm Extension`,
          variant: 'primary',
          accent: 'blue',
          role: 'confirm',
          onClick: async () => {
            try {
              await updateOneRecord({
                objectNameSingular: objectMetadataItem.nameSingular,
                idToUpdate: recordId,
                updateOneRecordInput: {
                  endDate: newEndDate.toISOString(),
                  accessStatus: 'ACTIVE',
                },
              });

              enqueueSuccessSnackBar({
                message: t`Subscription extended by ${extensionMonths} months`,
              });
            } catch {
              enqueueErrorSnackBar({
                message: t`Failed to extend subscription`,
              });
            }
          },
        },
      ],
    });
  };

  return <Action onClick={handleClick} />;
};
