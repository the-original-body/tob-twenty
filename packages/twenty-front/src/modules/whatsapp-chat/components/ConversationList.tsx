import styled from '@emotion/styled';
import { useCallback, useRef, useState } from 'react';

import { IconChevronDown } from 'twenty-ui/display';
import { ConversationListItem } from '@/whatsapp-chat/components/ConversationListItem';
import { ConversationSearch } from '@/whatsapp-chat/components/ConversationSearch';
import { useConversations } from '@/whatsapp-chat/hooks/useConversations';
import { type WaConversation, type WaSession } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledContainer = styled.div`
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 340px;
  min-width: 340px;
`;

const StyledHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledSessionSelect = styled.select`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  outline: none;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledSectionLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  letter-spacing: 0.05em;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  text-transform: uppercase;
`;

const StyledLoadMore = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledLoading = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

type ConversationListProps = {
  sessions: WaSession[];
  selectedConversationId: string | null;
  onSelectConversation: (conversation: WaConversation) => void;
  onConversationsLoaded?: (conversations: WaConversation[]) => void;
};

export const ConversationList = ({
  sessions,
  selectedConversationId,
  onSelectConversation,
  onConversationsLoaded,
}: ConversationListProps) => {
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const previousConversationsRef = useRef<WaConversation[]>([]);

  const {
    conversations,
    loading,
    hasMore,
    loadMore,
  } = useConversations({
    session: selectedSession || undefined,
    search: search || undefined,
  });

  if (
    onConversationsLoaded &&
    conversations !== previousConversationsRef.current
  ) {
    previousConversationsRef.current = conversations;
    onConversationsLoaded(conversations);
  }

  const pinnedConversations = conversations.filter((c) => c.isPinned);
  const unpinnedConversations = conversations.filter((c) => !c.isPinned);

  const handleClick = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id);

      if (conversation) {
        onSelectConversation(conversation);
      }
    },
    [conversations, onSelectConversation],
  );

  return (
    <StyledContainer>
      <StyledHeader>
        {sessions.length > 1 && (
          <StyledSessionSelect
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">All sessions</option>
            {sessions.map((session) => (
              <option key={session.name} value={session.name}>
                {session.name}
                {session.me?.pushName ? ` (${session.me.pushName})` : ''}
              </option>
            ))}
          </StyledSessionSelect>
        )}
        <ConversationSearch value={search} onChange={setSearch} />
      </StyledHeader>

      <StyledList>
        {loading && conversations.length === 0 && (
          <StyledLoading>Loading conversations...</StyledLoading>
        )}

        {!loading && conversations.length === 0 && (
          <StyledEmptyState>
            {search
              ? 'No conversations match your search'
              : 'No conversations yet'}
          </StyledEmptyState>
        )}

        {pinnedConversations.length > 0 && (
          <>
            <StyledSectionLabel>Pinned</StyledSectionLabel>
            {pinnedConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={handleClick}
              />
            ))}
          </>
        )}

        {unpinnedConversations.length > 0 && (
          <>
            {pinnedConversations.length > 0 && (
              <StyledSectionLabel>All messages</StyledSectionLabel>
            )}
            {unpinnedConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={handleClick}
              />
            ))}
          </>
        )}

        {hasMore && (
          <StyledLoadMore onClick={loadMore}>
            <IconChevronDown size={14} />
            Load more
          </StyledLoadMore>
        )}
      </StyledList>
    </StyledContainer>
  );
};
