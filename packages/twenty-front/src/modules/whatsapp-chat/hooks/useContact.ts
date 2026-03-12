import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface TobContact {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  country: string | null;
  source: string | null;
  isClient: boolean;
  isMainProgramClient: boolean;
  isTrainingCertClient: boolean;
  isActiveMainProgramClient: boolean;
  isFinishingLzr30Days: boolean;
  lzrStartDate: string | null;
  lzrEndDate: string | null;
  lzrMonthDuration: string | null;
  bexioClientId: string | null;
  contractIsSigned: boolean;
  pandadocIsSigned: boolean;
  docusealIsSigned: boolean;
  tobAssignedName: string | null;
  tobAssignedEmail: string | null;
}

export const useContact = (phone: string | undefined) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [contact, setContact] = useState<TobContact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async () => {
    if (!phone) {
      setContact(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await bridgeFetch<TobContact>(
        `/api/v1/contacts/by-phone/${encodeURIComponent(phone)}`,
      );
      setContact(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load contact';

      if (message.includes('404')) {
        setContact(null);
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, phone]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return { contact, loading, error, refetch: fetchContact };
};
