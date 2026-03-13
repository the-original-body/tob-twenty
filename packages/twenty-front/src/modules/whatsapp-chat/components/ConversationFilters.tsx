import { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

export type StateFilter = 'all' | 'unread' | 'needs_reply';
export type SortOrder = 'newest' | 'oldest';
export type AssignmentFilter = 'all' | 'me' | 'unassigned';
export type SegmentFilter = 'all' | 'leads' | 'clients';
export type NeedsReplyThreshold = 'any' | '24h' | '48h' | '72h';

const PROGRAM_COLORS: Record<string, string> = {
  JP: '#3b82f6',
  BPA: '#06b6d4',
  BPE: '#6366f1',
  CERT: '#10b981',
  Alumni: '#64748b',
  Canceled: '#f43f5e',
  Lead: '#a8a29e',
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  min-width: 70px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const StyledPill = styled.button<{ isActive: boolean }>`
  background: ${({ isActive, theme }) =>
    isActive ? theme.background.transparent.blue : theme.background.transparent.lighter};
  border: 1px solid
    ${({ isActive, theme }) =>
      isActive ? theme.accent.tertiary : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 3px 10px;
  transition: all 120ms ease;
  white-space: nowrap;

  &:hover {
    background: ${({ isActive, theme }) =>
      isActive ? theme.background.transparent.blue : theme.background.transparent.light};
    color: ${({ isActive, theme }) =>
      isActive ? theme.color.blue : theme.font.color.secondary};
  }
`;

const StyledToggle = styled.button<{ isActive: boolean }>`
  background: ${({ isActive, theme }) =>
    isActive ? theme.background.transparent.blue : 'transparent'};
  border: 1px solid
    ${({ isActive, theme }) =>
      isActive ? theme.accent.tertiary : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: 3px 8px;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledSortSelect = styled.select`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-left: auto;
  outline: none;
  padding: 3px 6px;
`;

const StyledSpacer = styled.div`
  flex: 1;
`;

const StyledDropdownWrapper = styled.div`
  position: relative;
`;

const StyledDropdownButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive, theme }) =>
    isActive ? theme.background.transparent.blue : theme.background.transparent.lighter};
  border: 1px solid
    ${({ isActive, theme }) =>
      isActive ? theme.accent.tertiary : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 4px 10px;
  white-space: nowrap;

  &:hover {
    background: ${({ isActive, theme }) =>
      isActive ? theme.background.transparent.blue : theme.background.transparent.light};
    color: ${({ isActive, theme }) =>
      isActive ? theme.color.blue : theme.font.color.secondary};
  }
`;

const StyledBadge = styled.span`
  align-items: center;
  background: ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ theme }) => theme.background.primary};
  display: inline-flex;
  font-size: 10px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
  height: 16px;
  justify-content: center;
  min-width: 16px;
  padding: 0 4px;
`;

const StyledDropdownPanel = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  left: 0;
  max-height: 280px;
  min-width: 200px;
  overflow-y: auto;
  position: absolute;
  top: calc(100% + 4px);
  z-index: 10;
`;

const StyledDropdownHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
`;

const StyledDropdownTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledDropdownClear = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.blue};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledCheckboxRow = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledCheckbox = styled.input`
  accent-color: ${({ theme }) => theme.color.blue};
  cursor: pointer;
  height: 14px;
  margin: 0;
  width: 14px;
`;

const StyledColorDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const StyledCheckboxLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledCountRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledCountText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledClearLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.blue};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledChevron = styled.span`
  font-size: 10px;
  line-height: 1;
`;

type ConversationFiltersProps = {
  stateFilter: StateFilter;
  onStateFilterChange: (filter: StateFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  assignmentFilter: AssignmentFilter;
  onAssignmentFilterChange: (filter: AssignmentFilter) => void;
  segmentFilter: SegmentFilter;
  onSegmentFilterChange: (filter: SegmentFilter) => void;
  needsReplyThreshold: NeedsReplyThreshold;
  onNeedsReplyThresholdChange: (threshold: NeedsReplyThreshold) => void;
  selectedPrograms: string[];
  onSelectedProgramsChange: (programs: string[]) => void;
  selectedDurations: string[];
  onSelectedDurationsChange: (durations: string[]) => void;
  availablePrograms: string[];
  availableDurations: string[];
  resultCount?: number;
  totalCount?: number;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
};

const MultiSelectDropdown = ({
  label,
  selected,
  options,
  onChange,
  renderOption,
}: {
  label: string;
  selected: string[];
  options: string[];
  onChange: (selected: string[]) => void;
  renderOption?: (option: string) => React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <StyledDropdownWrapper ref={wrapperRef}>
      <StyledDropdownButton
        isActive={selected.length > 0}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        {selected.length > 0 && <StyledBadge>{selected.length}</StyledBadge>}
        <StyledChevron>{isOpen ? '\u25B4' : '\u25BE'}</StyledChevron>
      </StyledDropdownButton>
      {isOpen && (
        <StyledDropdownPanel>
          <StyledDropdownHeader>
            <StyledDropdownTitle>{label}</StyledDropdownTitle>
            {selected.length > 0 && (
              <StyledDropdownClear onClick={() => onChange([])}>
                Clear
              </StyledDropdownClear>
            )}
          </StyledDropdownHeader>
          {options.map((option) => (
            <StyledCheckboxRow key={option}>
              <StyledCheckbox
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => handleToggle(option)}
              />
              {renderOption ? (
                renderOption(option)
              ) : (
                <StyledCheckboxLabel>{option}</StyledCheckboxLabel>
              )}
            </StyledCheckboxRow>
          ))}
        </StyledDropdownPanel>
      )}
    </StyledDropdownWrapper>
  );
};

export const ConversationFilters = ({
  stateFilter,
  onStateFilterChange,
  sortOrder,
  onSortOrderChange,
  showArchived,
  onShowArchivedChange,
  assignmentFilter,
  onAssignmentFilterChange,
  segmentFilter,
  onSegmentFilterChange,
  needsReplyThreshold,
  onNeedsReplyThresholdChange,
  selectedPrograms,
  onSelectedProgramsChange,
  selectedDurations,
  onSelectedDurationsChange,
  availablePrograms,
  availableDurations,
  resultCount,
  totalCount,
  onClearFilters,
  hasActiveFilters,
}: ConversationFiltersProps) => {
  return (
    <StyledContainer>
      {/* Assignment row */}
      <StyledRow>
        <StyledLabel>Assigned</StyledLabel>
        <StyledPill
          isActive={assignmentFilter === 'all'}
          onClick={() => onAssignmentFilterChange('all')}
        >
          All
        </StyledPill>
        <StyledPill
          isActive={assignmentFilter === 'me'}
          onClick={() => onAssignmentFilterChange('me')}
        >
          Me
        </StyledPill>
        <StyledPill
          isActive={assignmentFilter === 'unassigned'}
          onClick={() => onAssignmentFilterChange('unassigned')}
        >
          Unassigned
        </StyledPill>
      </StyledRow>

      {/* Segment row */}
      <StyledRow>
        <StyledLabel>Segment</StyledLabel>
        <StyledPill
          isActive={segmentFilter === 'all'}
          onClick={() => onSegmentFilterChange('all')}
        >
          All
        </StyledPill>
        <StyledPill
          isActive={segmentFilter === 'leads'}
          onClick={() => onSegmentFilterChange('leads')}
        >
          Leads
        </StyledPill>
        <StyledPill
          isActive={segmentFilter === 'clients'}
          onClick={() => onSegmentFilterChange('clients')}
        >
          Clients
        </StyledPill>
      </StyledRow>

      {/* State row */}
      <StyledRow>
        <StyledLabel>State</StyledLabel>
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

      {/* Needs reply threshold sub-row */}
      {stateFilter === 'needs_reply' && (
        <StyledRow>
          <StyledLabel />
          <StyledPill
            isActive={needsReplyThreshold === 'any'}
            onClick={() => onNeedsReplyThresholdChange('any')}
          >
            Any
          </StyledPill>
          <StyledPill
            isActive={needsReplyThreshold === '24h'}
            onClick={() => onNeedsReplyThresholdChange('24h')}
          >
            &gt;24h
          </StyledPill>
          <StyledPill
            isActive={needsReplyThreshold === '48h'}
            onClick={() => onNeedsReplyThresholdChange('48h')}
          >
            &gt;48h
          </StyledPill>
          <StyledPill
            isActive={needsReplyThreshold === '72h'}
            onClick={() => onNeedsReplyThresholdChange('72h')}
          >
            &gt;72h
          </StyledPill>
        </StyledRow>
      )}

      {/* Advanced filters row */}
      <StyledRow>
        <StyledLabel>Filters</StyledLabel>
        <MultiSelectDropdown
          label="Program"
          selected={selectedPrograms}
          options={availablePrograms}
          onChange={onSelectedProgramsChange}
          renderOption={(option) => (
            <>
              <StyledColorDot
                dotColor={PROGRAM_COLORS[option] ?? '#94a3b8'}
              />
              <StyledCheckboxLabel>{option}</StyledCheckboxLabel>
            </>
          )}
        />
        <MultiSelectDropdown
          label="Duration"
          selected={selectedDurations}
          options={availableDurations}
          onChange={onSelectedDurationsChange}
        />
        <StyledSpacer />
      </StyledRow>

      {/* Count + Clear row */}
      {(resultCount !== undefined && totalCount !== undefined) ||
      hasActiveFilters ? (
        <StyledCountRow>
          {resultCount !== undefined && totalCount !== undefined && (
            <StyledCountText>
              Showing {resultCount} of {totalCount}
            </StyledCountText>
          )}
          {hasActiveFilters && onClearFilters && (
            <StyledClearLink onClick={onClearFilters}>
              Clear filters
            </StyledClearLink>
          )}
        </StyledCountRow>
      ) : null}
    </StyledContainer>
  );
};
