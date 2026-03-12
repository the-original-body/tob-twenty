import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';

export interface CloseOpportunity {
  id: string;
  contactPhone: string | null;
  statusLabel: string | null;
  statusType: string | null;
  confidence: number | null;
  value: number | null;
  valuePeriod: string | null;
  note: string | null;
  leadName: string | null;
  userName: string | null;
  dateCreated: string | null;
  dateWon: string | null;
  dateLost: string | null;
}

interface CloseOpportunitiesResponse {
  items: CloseOpportunity[];
  total: number;
}

export const useCloseOpportunities = (phone: string | undefined) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [opportunities, setOpportunities] = useState<CloseOpportunity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOpportunities = useCallback(async () => {
    if (!phone) {
      setOpportunities([]);
      return;
    }

    setLoading(true);

    try {
      const data = await bridgeFetch<CloseOpportunitiesResponse>(
        `/api/v1/close/opportunities/${encodeURIComponent(phone)}`,
      );
      setOpportunities(data.items);
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, phone]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return { opportunities, loading, refetch: fetchOpportunities };
};
