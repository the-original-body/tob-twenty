import styled from '@emotion/styled';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { currentConversationIdState } from '@/whatsapp-chat/states/currentConversationIdState';
import { ChatHeader } from '@/whatsapp-chat/components/ChatHeader';
import { ChatThread } from '@/whatsapp-chat/components/ChatThread';
import { ConversationDetails } from '@/whatsapp-chat/components/ConversationDetails';
import { ConversationList } from '@/whatsapp-chat/components/ConversationList';
import { useLabels } from '@/whatsapp-chat/hooks/useLabels';
import { useMessages } from '@/whatsapp-chat/hooks/useMessages';
import { useSendMessage } from '@/whatsapp-chat/hooks/useSendMessage';
import { useSessions } from '@/whatsapp-chat/hooks/useSessions';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { useWhatsAppWebSocket } from '@/whatsapp-chat/hooks/useWhatsAppWebSocket';
import {
  type WaConversation,
  type WaMessage,
  type WsEvent,
} from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledCenterPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledEmptyCenter = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.lg};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const StyledEmptySubtext = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledConnectionStatus = styled.div<{ connected: boolean }>`
  align-items: center;
  background: ${({ connected, theme }) =>
    connected
      ? theme.background.transparent.lighter
      : theme.background.danger};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ connected, theme }) =>
    connected ? theme.font.color.tertiary : theme.color.red};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDot = styled.div<{ connected: boolean }>`
  background: ${({ connected, theme }) =>
    connected ? '#22c55e' : theme.color.red};
  border-radius: 50%;
  height: 6px;
  width: 6px;
`;

export const WhatsAppChatContainer = () => {
  const { bridgeFetch } = useWhatsAppBridge();
  const { sessions } = useSessions();

  const [currentConversationId, setCurrentConversationId] = useRecoilStateV2(
    currentConversationIdState,
  );

  const [selectedConversation, setSelectedConversation] =
    useState<WaConversation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const conversationsRef = useRef<WaConversation[]>([]);

  const { labels, addLabel, removeLabel } = useLabels(currentConversationId);

  const {
    messages,
    loading: messagesLoading,
    hasMore,
    loadOlder,
    addMessage,
    addOptimisticMessage,
    updateMessageByTempId,
    updateMessageById,
  } = useMessages({ conversationId: currentConversationId });

  const handleWebSocketEvent = useCallback(
    (event: WsEvent) => {
      switch (event.type) {
        case 'message.new': {
          const msgData = event.data as unknown as WaMessage;

          if (
            msgData.conversationId === currentConversationId ||
            event.conversation_id === currentConversationId
          ) {
            addMessage(msgData);
          }

          break;
        }

        case 'message.status': {
          const { id, status, temp_id: tempId } = event.data as {
            id?: string;
            status?: WaMessage['status'];
            temp_id?: string;
          };

          if (status) {
            if (tempId) {
              updateMessageByTempId(tempId, { status, id: id ?? undefined });
            }

            if (id) {
              updateMessageById(id, { status });
            }
          }

          break;
        }

        case 'message.edited': {
          const { id, new_body: newBody } = event.data as {
            id?: string;
            new_body?: string;
          };

          if (id && newBody !== undefined) {
            updateMessageById(id, { body: newBody, isEdited: true });
          }

          break;
        }

        case 'message.deleted': {
          const { id } = event.data as { id?: string };

          if (id) {
            updateMessageById(id, { isDeleted: true });
          }

          break;
        }

        default:
          break;
      }
    },
    [
      currentConversationId,
      addMessage,
      updateMessageByTempId,
      updateMessageById,
    ],
  );

  const { connected } = useWhatsAppWebSocket({
    onEvent: handleWebSocketEvent,
  });

  const handleSendError = useCallback(
    (tempId: string) => {
      updateMessageByTempId(tempId, { status: 'FAILED' });
    },
    [updateMessageByTempId],
  );

  const { sendTextMessage, sendMediaMessage } = useSendMessage({
    onOptimisticMessage: addOptimisticMessage,
    onError: handleSendError,
  });

  const handleSelectConversation = useCallback(
    (conversation: WaConversation) => {
      setCurrentConversationId(conversation.id);
      setSelectedConversation(conversation);
    },
    [setCurrentConversationId],
  );

  const handleSendText = useCallback(
    (body: string) => {
      if (!selectedConversation) return;

      sendTextMessage({
        conversationId: selectedConversation.id,
        sessionName: selectedConversation.sessionName,
        toJid: selectedConversation.leadPhoneNumber,
        body,
      });
    },
    [selectedConversation, sendTextMessage],
  );

  const handleSendMedia = useCallback(
    async (file: File) => {
      if (!selectedConversation) return;

      const reader = new FileReader();

      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const type = file.type.startsWith('audio/') ? 'voice' : 'image';

        sendMediaMessage({
          conversationId: selectedConversation.id,
          sessionName: selectedConversation.sessionName,
          toJid: selectedConversation.leadPhoneNumber,
          type: type as 'image' | 'voice',
          mediaBase64: base64,
          mediaMimetype: file.type,
          body: file.name,
        });
      };

      reader.readAsDataURL(file);
    },
    [selectedConversation, sendMediaMessage],
  );

  const handleTogglePin = useCallback(
    async (id: string, isPinned: boolean) => {
      try {
        await bridgeFetch(`/api/v1/conversations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_pinned: isPinned }),
        });

        if (selectedConversation?.id === id) {
          setSelectedConversation((prev) =>
            prev ? { ...prev, isPinned } : null,
          );
        }
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, selectedConversation],
  );

  const handleArchive = useCallback(
    async (id: string) => {
      try {
        await bridgeFetch(`/api/v1/conversations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_archived: true }),
        });

        if (currentConversationId === id) {
          setCurrentConversationId(null);
          setSelectedConversation(null);
        }
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, currentConversationId, setCurrentConversationId],
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newBody: string) => {
      try {
        await bridgeFetch(`/api/v1/messages/${messageId}/edit`, {
          method: 'POST',
          body: JSON.stringify({ new_body: newBody }),
        });
        updateMessageById(messageId, { body: newBody, isEdited: true });
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, updateMessageById],
  );

  const handleDeleteMessage = useCallback(
    async (message: WaMessage) => {
      try {
        await bridgeFetch(`/api/v1/messages/${message.id}/delete`, {
          method: 'POST',
        });
        updateMessageById(message.id, { isDeleted: true });
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, updateMessageById],
  );

  const handleConversationUpdate = useCallback(
    (id: string, updates: Partial<WaConversation>) => {
      if (selectedConversation?.id === id) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, ...updates } : null,
        );
      }
    },
    [selectedConversation],
  );

  return (
    <StyledContainer>
      <ConversationList
        sessions={sessions}
        selectedConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onConversationsLoaded={(convs) => {
          conversationsRef.current = convs;
        }}
      />

      <StyledCenterPanel>
        {!connected && (
          <StyledConnectionStatus connected={false}>
            <StyledDot connected={false} />
            Reconnecting to WhatsApp bridge...
          </StyledConnectionStatus>
        )}

        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              labels={labels}
              onAddLabel={addLabel}
              onRemoveLabel={removeLabel}
              onTogglePin={handleTogglePin}
              onArchive={handleArchive}
              onToggleDetails={() => setShowDetails((prev) => !prev)}
            />
            <ChatThread
              conversation={selectedConversation}
              messages={messages}
              loading={messagesLoading}
              hasMore={hasMore}
              onLoadOlder={loadOlder}
              onSendText={handleSendText}
              onSendMedia={handleSendMedia}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          </>
        ) : (
          <StyledEmptyCenter>
            WhatsApp Chat
            <StyledEmptySubtext>
              Select a conversation to start messaging
            </StyledEmptySubtext>
          </StyledEmptyCenter>
        )}
      </StyledCenterPanel>

      {showDetails && selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          onClose={() => setShowDetails(false)}
          onUpdate={handleConversationUpdate}
        />
      )}
    </StyledContainer>
  );
};
