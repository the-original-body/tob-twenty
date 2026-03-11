import { useCallback } from 'react';

import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { WHATSAPP_BRIDGE_URL } from '@/whatsapp-chat/constants/WhatsAppBridgeUrl';

interface BridgeFetchOptions extends RequestInit {
  skipContentType?: boolean;
}

export const useWhatsAppBridge = () => {
  const tokenPair = useRecoilValueV2(tokenPairState);

  const bridgeFetch = useCallback(
    async <T = unknown>(
      path: string,
      options: BridgeFetchOptions = {},
    ): Promise<T> => {
      const { skipContentType, ...fetchOptions } = options;

      const headers = new Headers(fetchOptions.headers);

      if (!skipContentType && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      if (tokenPair?.accessOrWorkspaceAgnosticToken) {
        headers.set(
          'Authorization',
          `Bearer ${tokenPair.accessOrWorkspaceAgnosticToken}`,
        );
      }

      const url = `${WHATSAPP_BRIDGE_URL}${path}`;

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `Bridge API error ${response.status}: ${errorBody}`,
        );
      }

      const text = await response.text();

      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    },
    [tokenPair],
  );

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = tokenPair?.accessOrWorkspaceAgnosticToken ?? '';

    return `${protocol}//${host}${WHATSAPP_BRIDGE_URL}/ws?token=${encodeURIComponent(token)}`;
  }, [tokenPair]);

  return { bridgeFetch, getWebSocketUrl };
};
