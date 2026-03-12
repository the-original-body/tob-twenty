import styled from '@emotion/styled';

import { type WaLabel } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledBadge = styled.div<{ labelColor: string }>`
  align-items: center;
  background: ${({ labelColor }) => `${labelColor}20`};
  border: 1px solid ${({ labelColor }) => `${labelColor}40`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ labelColor }) => labelColor};
  display: inline-flex;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: 4px;
  line-height: 1;
  padding: 2px 8px;
  white-space: nowrap;
`;

const StyledRemoveButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  font-size: 12px;
  line-height: 1;
  opacity: 0.6;
  padding: 0;

  &:hover {
    opacity: 1;
  }
`;

type LabelBadgeProps = {
  label: WaLabel;
  onRemove?: (labelId: string) => void;
};

export const LabelBadge = ({ label, onRemove }: LabelBadgeProps) => {
  return (
    <StyledBadge labelColor={label.color}>
      {label.name}
      {onRemove && (
        <StyledRemoveButton
          onClick={(e) => {
            e.stopPropagation();
            onRemove(label.id);
          }}
        >
          ×
        </StyledRemoveButton>
      )}
    </StyledBadge>
  );
};
