import { useCallback, useEffect, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { type WaLabel } from '@/whatsapp-chat/types/WhatsAppTypes';

export const useLabels = (conversationId: string | null) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const [labels, setLabels] = useState<WaLabel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLabels = useCallback(async () => {
    if (!conversationId) {
      setLabels([]);
      return;
    }

    setLoading(true);

    try {
      const response = await bridgeFetch<{ items: WaLabel[] }>(
        `/api/v1/labels?conversationId=${encodeURIComponent(conversationId)}`,
      );
      setLabels(response.items);
    } catch {
      setLabels([]);
    } finally {
      setLoading(false);
    }
  }, [bridgeFetch, conversationId]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const addLabel = useCallback(
    async (name: string, color: string) => {
      if (!conversationId) return;

      const response = await bridgeFetch<WaLabel>('/api/v1/labels', {
        method: 'POST',
        body: JSON.stringify({
          name,
          color,
          conversation_id: conversationId,
        }),
      });

      setLabels((prev) => [...prev, response]);

      return response;
    },
    [bridgeFetch, conversationId],
  );

  const removeLabel = useCallback(
    async (labelId: string) => {
      await bridgeFetch(`/api/v1/labels/${labelId}`, {
        method: 'DELETE',
      });

      setLabels((prev) => prev.filter((l) => l.id !== labelId));
    },
    [bridgeFetch],
  );

  return { labels, loading, addLabel, removeLabel, refetch: fetchLabels };
};
