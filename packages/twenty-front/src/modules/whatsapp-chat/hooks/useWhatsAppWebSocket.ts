import { useCallback, useEffect, useRef, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { type WsEvent } from '@/whatsapp-chat/types/WhatsAppTypes';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

interface UseWhatsAppWebSocketOptions {
  onEvent?: (event: WsEvent) => void;
}

export const useWhatsAppWebSocket = ({
  onEvent,
}: UseWhatsAppWebSocketOptions = {}) => {
  const { getWebSocketUrl } = useWhatsAppBridge();

  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const url = getWebSocketUrl();
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WsEvent;

        setLastEvent(parsed);
        onEventRef.current?.(parsed);
      } catch {
        // Ignore non-JSON messages (e.g. pings)
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;

      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(
          connect,
          RECONNECT_DELAY_MS,
        );
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [getWebSocketUrl]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connected, lastEvent };
};
