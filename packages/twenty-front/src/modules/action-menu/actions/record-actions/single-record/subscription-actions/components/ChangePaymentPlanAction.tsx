import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';

export const ChangePaymentPlanAction = () => {
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

    const currentPaymentStatus = (record.paymentStatus as string) || t`Not set`;
    const newPaymentStatus =
      currentPaymentStatus === 'INSTALLMENTS' ? 'PAID' : 'INSTALLMENTS';
    const newPaymentLabel =
      newPaymentStatus === 'INSTALLMENTS' ? t`Installments` : t`Paid (Upfront)`;

    enqueueDialog({
      title: t`Change Payment Plan`,
      message: t`Current payment status: ${currentPaymentStatus}\n\nSwitch to: ${newPaymentLabel}`,
      buttons: [
        {
          title: t`Cancel`,
          variant: 'secondary',
        },
        {
          title: t`Switch to ${newPaymentLabel}`,
          variant: 'primary',
          accent: 'blue',
          role: 'confirm',
          onClick: async () => {
            try {
              await updateOneRecord({
                objectNameSingular: objectMetadataItem.nameSingular,
                idToUpdate: recordId,
                updateOneRecordInput: {
                  paymentStatus: newPaymentStatus,
                },
              });

              enqueueSuccessSnackBar({
                message: t`Payment plan changed to ${newPaymentLabel}`,
              });
            } catch {
              enqueueErrorSnackBar({
                message: t`Failed to change payment plan`,
              });
            }
          },
        },
      ],
    });
  };

  return <Action onClick={handleClick} />;
};
