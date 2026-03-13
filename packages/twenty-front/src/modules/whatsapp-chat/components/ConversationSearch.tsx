import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { IconSearch, IconX } from 'twenty-ui/display';

const StyledSearchContainer = styled.div<{ isFocused?: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ isFocused, theme }) =>
    isFocused ? theme.color.blue : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-shrink: 0;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledClearButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.light};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type ConversationSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ConversationSearch = ({
  value,
  onChange,
}: ConversationSearchProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <StyledSearchContainer isFocused={isFocused}>
      <StyledSearchIcon>
        <IconSearch size={16} />
      </StyledSearchIcon>
      <StyledInput
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value && (
        <StyledClearButton onClick={handleClear}>
          <IconX size={14} />
        </StyledClearButton>
      )}
    </StyledSearchContainer>
  );
};
