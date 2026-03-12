import styled from '@emotion/styled';
import { useCallback, useMemo, useRef, useState } from 'react';

import { IconChevronDown } from 'twenty-ui/display';
import { ConversationListItem } from '@/whatsapp-chat/components/ConversationListItem';
import {
  ConversationFilters,
  type SortOrder,
  type StateFilter,
} from '@/whatsapp-chat/components/ConversationFilters';
import { ConversationSearch } from '@/whatsapp-chat/components/ConversationSearch';
import { useConversations } from '@/whatsapp-chat/hooks/useConversations';
import {
  type WaConversation,
  type WaSession,
} from '@/whatsapp-chat/types/WhatsAppTypes';

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
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onArchive?: (id: string) => void;
  onToggleRead?: (id: string, isUnread: boolean) => void;
};

export const ConversationList = ({
  sessions,
  selectedConversationId,
  onSelectConversation,
  onConversationsLoaded,
  onTogglePin,
  onArchive,
  onToggleRead,
}: ConversationListProps) => {
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showArchived, setShowArchived] = useState(false);
  const previousConversationsRef = useRef<WaConversation[]>([]);

  const { conversations, loading, hasMore, loadMore } = useConversations({
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

  // Apply local filters
  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Archive filter
    if (!showArchived) {
      result = result.filter((c) => !c.isArchived);
    } else {
      result = result.filter((c) => c.isArchived);
    }

    // State filter
    if (stateFilter === 'unread') {
      result = result.filter((c) => c.isUnread || !c.lastMessageFromAgent);
    } else if (stateFilter === 'needs_reply') {
      result = result.filter((c) => !c.lastMessageFromAgent);
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aTime = new Date(a.lastMessageAt).getTime();
      const bTime = new Date(b.lastMessageAt).getTime();

      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [conversations, stateFilter, sortOrder, showArchived]);

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const unpinnedConversations = filteredConversations.filter(
    (c) => !c.isPinned,
  );

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
        <ConversationFilters
          stateFilter={stateFilter}
          onStateFilterChange={setStateFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
          resultCount={filteredConversations.length}
          totalCount={conversations.length}
        />
      </StyledHeader>

      <StyledList>
        {loading && conversations.length === 0 && (
          <StyledLoading>Loading conversations...</StyledLoading>
        )}

        {!loading && filteredConversations.length === 0 && (
          <StyledEmptyState>
            {search
              ? 'No conversations match your search'
              : stateFilter !== 'all'
                ? 'No conversations match this filter'
                : showArchived
                  ? 'No archived conversations'
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
                onTogglePin={onTogglePin}
                onArchive={onArchive}
                onToggleRead={onToggleRead}
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
                onTogglePin={onTogglePin}
                onArchive={onArchive}
                onToggleRead={onToggleRead}
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
