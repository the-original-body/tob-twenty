import { useCallback, useEffect, useState } from 'react';

import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { whatsAppSessionsState } from '@/whatsapp-chat/states/whatsAppSessionsState';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { type WaSession } from '@/whatsapp-chat/types/WhatsAppTypes';

export const useSessions = () => {
  const { bridgeFetch } = useWhatsAppBridge();
  const setSessions = useSetRecoilStateV2(whatsAppSessionsState);

  const [sessions, setLocalSessions] = useState<WaSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await bridgeFetch<WaSession[]>('/api/v1/sessions');
      const result = data ?? [];

      setLocalSessions(result);
      setSessions(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, setSessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refresh: fetchSessions };
};
