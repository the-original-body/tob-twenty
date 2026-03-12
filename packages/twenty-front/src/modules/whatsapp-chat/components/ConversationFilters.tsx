import styled from '@emotion/styled';

export type StateFilter = 'all' | 'unread' | 'needs_reply';
export type SortOrder = 'newest' | 'oldest';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPill = styled.button<{ isActive: boolean }>`
  background: ${({ isActive, theme }) =>
    isActive ? theme.color.blue + '18' : theme.background.transparent.lighter};
  border: 1px solid
    ${({ isActive, theme }) =>
      isActive ? theme.color.blue + '40' : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 3px 10px;
  transition: all 120ms ease;
  white-space: nowrap;

  &:hover {
    background: ${({ isActive, theme }) =>
      isActive ? theme.color.blue + '25' : theme.background.transparent.light};
  }
`;

const StyledSortSelect = styled.select`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-left: auto;
  outline: none;
  padding: 3px 6px;
`;

const StyledToggle = styled.button<{ isActive: boolean }>`
  background: ${({ isActive, theme }) =>
    isActive ? theme.color.blue + '18' : 'transparent'};
  border: 1px solid
    ${({ isActive, theme }) =>
      isActive ? theme.color.blue + '40' : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: 3px 8px;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type ConversationFiltersProps = {
  stateFilter: StateFilter;
  onStateFilterChange: (filter: StateFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  resultCount?: number;
  totalCount?: number;
};

export const ConversationFilters = ({
  stateFilter,
  onStateFilterChange,
  sortOrder,
  onSortOrderChange,
  showArchived,
  onShowArchivedChange,
  resultCount,
  totalCount,
}: ConversationFiltersProps) => {
  return (
    <StyledContainer>
      <StyledRow>
        <StyledPill
          isActive={stateFilter === 'all'}
          onClick={() => onStateFilterChange('all')}
        >
          All
        </StyledPill>
        <StyledPill
          isActive={stateFilter === 'unread'}
          onClick={() => onStateFilterChange('unread')}
        >
          Unread
        </StyledPill>
        <StyledPill
          isActive={stateFilter === 'needs_reply'}
          onClick={() => onStateFilterChange('needs_reply')}
        >
          Needs reply
        </StyledPill>
        <StyledToggle
          isActive={showArchived}
          onClick={() => onShowArchivedChange(!showArchived)}
        >
          Archived
        </StyledToggle>
        <StyledSortSelect
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </StyledSortSelect>
      </StyledRow>
      {resultCount !== undefined &&
        totalCount !== undefined &&
        resultCount !== totalCount && (
          <span
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              paddingLeft: 2,
            }}
          >
            Showing {resultCount} of {totalCount}
          </span>
        )}
    </StyledContainer>
  );
};
