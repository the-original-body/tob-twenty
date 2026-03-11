import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useDebouncedCallback } from 'use-debounce';
import { logError } from '~/utils/logError';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledCallingCodeWrapper = styled.div`
  max-width: 100px;
  flex-shrink: 0;
`;

export const WhatsAppPhoneField = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useRecoilValueV2(
    currentWorkspaceMemberState,
  );

  const { record: fullMemberRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id,
    recordGqlFields: {
      id: true,
      whatsappPhone: true,
    },
  });

  const phoneData = (fullMemberRecord as Record<string, unknown>)
    ?.whatsappPhone as
    | {
        primaryPhoneNumber?: string;
        primaryPhoneCallingCode?: string;
        primaryPhoneCountryCode?: string;
      }
    | undefined;

  const [callingCode, setCallingCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (phoneData && !initialized) {
      setCallingCode(phoneData.primaryPhoneCallingCode ?? '');
      setPhoneNumber(phoneData.primaryPhoneNumber ?? '');
      setInitialized(true);
    }
  }, [phoneData, initialized]);

  const { updateOneRecord } = useUpdateOneRecord();

  const debouncedUpdate = useDebouncedCallback(
    async (newCallingCode: string, newPhoneNumber: string) => {
      try {
        if (!currentWorkspaceMember?.id) {
          throw new Error('User is not logged in');
        }

        await updateOneRecord({
          objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
          idToUpdate: currentWorkspaceMember.id,
          updateOneRecordInput: {
            whatsappPhone: {
              primaryPhoneNumber: newPhoneNumber,
              primaryPhoneCallingCode: newCallingCode,
              primaryPhoneCountryCode: '',
              additionalPhones: null,
            },
          },
        });
      } catch (error) {
        logError(error);
      }
    },
    500,
  );

  const handleCallingCodeChange = (value: string) => {
    setCallingCode(value);
    debouncedUpdate(value, phoneNumber);
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    debouncedUpdate(callingCode, value);
  };

  return (
    <StyledComboInputContainer>
      <StyledCallingCodeWrapper>
        <SettingsTextInput
          instanceId={`whatsapp-calling-code-${currentWorkspaceMember?.id}`}
          label={t`Calling Code`}
          value={callingCode}
          onChange={handleCallingCodeChange}
          placeholder="+49"
        />
      </StyledCallingCodeWrapper>
      <SettingsTextInput
        instanceId={`whatsapp-phone-${currentWorkspaceMember?.id}`}
        label={t`Phone Number`}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder="176 1234567"
        fullWidth
      />
    </StyledComboInputContainer>
  );
};
