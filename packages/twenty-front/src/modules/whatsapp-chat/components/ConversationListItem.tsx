import styled from '@emotion/styled';

import { IconPinned } from 'twenty-ui/display';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledItem = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  transition: background 120ms ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledAvatar = styled.div<{ isClient?: boolean }>`
  align-items: center;
  background: ${({ isClient, theme }) =>
    isClient ? theme.color.blue : theme.background.transparent.medium};
  border-radius: 50%;
  color: ${({ isClient, theme }) =>
    isClient ? theme.font.color.inverted : theme.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
`;

const StyledTopRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTimestamp = styled.span<{ isUnread?: boolean }>`
  color: ${({ isUnread, theme }) =>
    isUnread ? theme.color.blue : theme.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.xs};
  white-space: nowrap;
`;

const StyledBottomRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPreview = styled.span<{ isUnread?: boolean }>`
  color: ${({ isUnread, theme }) =>
    isUnread ? theme.font.color.primary : theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ isUnread, theme }) =>
    isUnread ? theme.font.weight.medium : theme.font.weight.regular};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBadges = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledUnreadDot = styled.div`
  background: ${({ theme }) => theme.color.blue};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`;

const StyledPinIcon = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
`;

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

const getInitials = (conversation: WaConversation): string => {
  const name = conversation.leadFullName || conversation.whatsappName;

  if (!name) {
    return conversation.leadPhoneNumber.slice(-2);
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return parts[0].slice(0, 2).toUpperCase();
};

type ConversationListItemProps = {
  conversation: WaConversation;
  isSelected: boolean;
  onClick: (id: string) => void;
};

export const ConversationListItem = ({
  conversation,
  isSelected,
  onClick,
}: ConversationListItemProps) => {
  const displayName =
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const previewPrefix = conversation.lastMessageFromAgent ? 'You: ' : '';

  return (
    <StyledItem
      isSelected={isSelected}
      onClick={() => onClick(conversation.id)}
    >
      <StyledAvatar isClient={conversation.isClient}>
        {getInitials(conversation)}
      </StyledAvatar>
      <StyledContent>
        <StyledTopRow>
          <StyledName>{displayName}</StyledName>
          <StyledTimestamp isUnread={conversation.isUnread}>
            {formatTimestamp(conversation.lastMessageAt)}
          </StyledTimestamp>
        </StyledTopRow>
        <StyledBottomRow>
          <StyledPreview isUnread={conversation.isUnread}>
            {previewPrefix}
            {conversation.lastMessageBody}
          </StyledPreview>
          <StyledBadges>
            {conversation.isPinned && (
              <StyledPinIcon>
                <IconPinned size={14} />
              </StyledPinIcon>
            )}
            {conversation.isUnread && <StyledUnreadDot />}
          </StyledBadges>
        </StyledBottomRow>
      </StyledContent>
    </StyledItem>
  );
};
