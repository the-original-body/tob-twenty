import styled from '@emotion/styled';
import { useCallback, useRef, useState } from 'react';

import { IconCheck } from 'twenty-ui/display';
import { type WaMessage } from '@/whatsapp-chat/types/WhatsAppTypes';
import { MediaDisplay } from '@/whatsapp-chat/components/MediaDisplay';
import { MessageContextMenu } from '@/whatsapp-chat/components/MessageContextMenu';
import { VoiceMessage } from '@/whatsapp-chat/components/VoiceMessage';

const StyledRow = styled.div<{ fromAgent: boolean }>`
  display: flex;
  justify-content: ${({ fromAgent }) => (fromAgent ? 'flex-end' : 'flex-start')};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(3)};
`;

const StyledBubble = styled.div<{ fromAgent: boolean }>`
  background: ${({ fromAgent, theme }) =>
    fromAgent
      ? theme.background.transparent.medium
      : theme.background.primary};
  border: 1px solid
    ${({ fromAgent, theme }) =>
      fromAgent ? theme.border.color.light : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: 65%;
  min-width: 80px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledBody = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
`;

const StyledTime = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 11px;
`;

const StyledStatus = styled.div<{ status: WaMessage['status'] }>`
  align-items: center;
  color: ${({ status, theme }) => {
    switch (status) {
      case 'SENDING':
        return theme.font.color.light;
      case 'SENT':
        return theme.font.color.tertiary;
      case 'DELIVERED':
        return theme.color.blue;
      case 'READ':
        return theme.color.blue;
      case 'FAILED':
        return theme.color.red;
      default:
        return theme.font.color.light;
    }
  }};
  display: flex;
`;

const StyledEditedLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 11px;
  font-style: italic;
`;

const StyledDeletedMessage = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: italic;
`;

const StyledEditTextArea = styled.textarea`
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.45;
  outline: none;
  padding: 0;
  resize: none;
  width: 100%;
`;

const StyledEditActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
`;

const StyledEditButton = styled.button<{ variant?: 'primary' }>`
  background: ${({ variant, theme }) =>
    variant === 'primary' ? theme.color.blue : 'transparent'};
  border: 1px solid
    ${({ variant, theme }) =>
      variant === 'primary' ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ variant, theme }) =>
    variant === 'primary' ? theme.font.color.inverted : theme.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  padding: 2px 8px;

  &:hover {
    opacity: 0.85;
  }
`;

const formatMessageTime = (isoString: string): string => {
  const date = new Date(isoString);

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DoubleCheck = ({ size }: { size: number }) => (
  <span style={{ display: 'inline-flex', marginLeft: -4 }}>
    <IconCheck size={size} style={{ marginRight: -6 }} />
    <IconCheck size={size} />
  </span>
);

const StatusIcon = ({ status }: { status: WaMessage['status'] }) => {
  switch (status) {
    case 'SENDING':
      return <IconCheck size={14} />;
    case 'SENT':
      return <IconCheck size={14} />;
    case 'DELIVERED':
      return <DoubleCheck size={14} />;
    case 'READ':
      return <DoubleCheck size={14} />;
    case 'FAILED':
      return (
        <span style={{ fontSize: '11px', fontWeight: 600 }}>!</span>
      );
    default:
      return null;
  }
};

type ChatMessageProps = {
  message: WaMessage;
  onEdit?: (messageId: string, newBody: string) => void;
  onDelete?: (message: WaMessage) => void;
};

export const ChatMessage = ({ message, onEdit, onDelete }: ChatMessageProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const editRef = useRef<HTMLTextAreaElement>(null);

  const isVoice =
    message.hasMedia && message.mediaMimetype?.startsWith('audio/');

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const handleCopy = useCallback((msg: WaMessage) => {
    if (msg.body) {
      navigator.clipboard.writeText(msg.body);
    }
  }, []);

  const handleStartEdit = useCallback((msg: WaMessage) => {
    setEditText(msg.body || '');
    setEditing(true);
    setTimeout(() => editRef.current?.focus(), 0);
  }, []);

  const handleSaveEdit = useCallback(() => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.body) {
      setEditing(false);
      return;
    }
    onEdit?.(message.id, trimmed);
    setEditing(false);
  }, [editText, message.id, message.body, onEdit]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      }
      if (e.key === 'Escape') {
        setEditing(false);
      }
    },
    [handleSaveEdit],
  );

  if (message.isDeleted) {
    return (
      <StyledRow fromAgent={message.fromAgent}>
        <StyledBubble fromAgent={message.fromAgent}>
          <StyledDeletedMessage>
            This message was deleted
          </StyledDeletedMessage>
          <StyledFooter>
            <StyledTime>
              {formatMessageTime(message.messageTimestamp)}
            </StyledTime>
          </StyledFooter>
        </StyledBubble>
      </StyledRow>
    );
  }

  return (
    <StyledRow fromAgent={message.fromAgent}>
      <StyledBubble
        fromAgent={message.fromAgent}
        onContextMenu={handleContextMenu}
      >
        {message.hasMedia && message.mediaUrl && !isVoice && (
          <MediaDisplay
            mediaUrl={message.mediaUrl}
            mediaMimetype={message.mediaMimetype}
            body={message.body}
          />
        )}

        {isVoice && message.mediaUrl && (
          <VoiceMessage mediaUrl={message.mediaUrl} />
        )}

        {editing ? (
          <>
            <StyledEditTextArea
              ref={editRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              rows={1}
            />
            <StyledEditActions>
              <StyledEditButton onClick={() => setEditing(false)}>
                Cancel
              </StyledEditButton>
              <StyledEditButton
                variant="primary"
                onClick={handleSaveEdit}
              >
                Save
              </StyledEditButton>
            </StyledEditActions>
          </>
        ) : (
          <>
            {message.body && !isVoice && (
              <StyledBody>{message.body}</StyledBody>
            )}

            <StyledFooter>
              {message.isEdited && <StyledEditedLabel>edited</StyledEditedLabel>}
              <StyledTime>{formatMessageTime(message.messageTimestamp)}</StyledTime>
              {message.fromAgent && (
                <StyledStatus status={message.status}>
                  <StatusIcon status={message.status} />
                </StyledStatus>
              )}
            </StyledFooter>
          </>
        )}
      </StyledBubble>

      {contextMenu && (
        <MessageContextMenu
          message={message}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onCopy={handleCopy}
          onEdit={onEdit ? handleStartEdit : undefined}
          onDelete={onDelete}
        />
      )}
    </StyledRow>
  );
};
