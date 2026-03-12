import { useCallback, useEffect, useRef, useState } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { type WsEvent } from '@/whatsapp-chat/types/WhatsAppTypes';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL_MS = 30000;

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
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  // Track subscriptions for re-subscribe on reconnect
  const subscribedConversationsRef = useRef<Set<string>>(new Set());
  const subscribedSessionsRef = useRef<Set<string>>(new Set());

  const sendMessage = useCallback((data: Record<string, unknown>) => {
    const ws = wsRef.current;

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }, []);

  const subscribeConversation = useCallback(
    (conversationId: string) => {
      subscribedConversationsRef.current.add(conversationId);
      sendMessage({ type: 'subscribe', conversation_id: conversationId });
    },
    [sendMessage],
  );

  const unsubscribeConversation = useCallback(
    (conversationId: string) => {
      subscribedConversationsRef.current.delete(conversationId);
      sendMessage({ type: 'unsubscribe', conversation_id: conversationId });
    },
    [sendMessage],
  );

  const subscribeSession = useCallback(
    (sessionName: string) => {
      subscribedSessionsRef.current.add(sessionName);
      sendMessage({ type: 'subscribe_session', session_name: sessionName });
    },
    [sendMessage],
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const url = getWebSocketUrl();
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
      reconnectAttemptsRef.current = 0;

      // Re-subscribe on reconnect
      for (const cid of subscribedConversationsRef.current) {
        ws.send(JSON.stringify({ type: 'subscribe', conversation_id: cid }));
      }
      for (const sid of subscribedSessionsRef.current) {
        ws.send(
          JSON.stringify({ type: 'subscribe_session', session_name: sid }),
        );
      }

      // Ping keepalive
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, PING_INTERVAL_MS);
    };

    ws.onmessage = (wsEvent) => {
      try {
        const parsed = JSON.parse(wsEvent.data) as WsEvent;

        if ((parsed as { type: string }).type === 'pong') return;

        setLastEvent(parsed);
        onEventRef.current?.(parsed);
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

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

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
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

  return {
    connected,
    lastEvent,
    subscribeConversation,
    unsubscribeConversation,
    subscribeSession,
  };
};
