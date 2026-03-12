import styled from '@emotion/styled';
import { useCallback, useRef, useState } from 'react';

import {
  IconArchive,
  IconPinned,
  IconPinnedOff,
  IconUser,
} from 'twenty-ui/display';
import { type WaConversation, type WaLabel } from '@/whatsapp-chat/types/WhatsAppTypes';
import { LabelBadge } from '@/whatsapp-chat/components/LabelBadge';
import { LabelPicker } from '@/whatsapp-chat/components/LabelPicker';

const StyledContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 56px;
`;

const StyledTopRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.medium};
  border-radius: 50%;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPhone = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledRight = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledLabelsRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledAddLabelButton = styled.button`
  align-items: center;
  background: none;
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 11px;
  gap: 2px;
  line-height: 1;
  padding: 2px 8px;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.font.color.secondary};
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

type ChatHeaderProps = {
  conversation: WaConversation;
  labels: WaLabel[];
  onAddLabel: (name: string, color: string) => Promise<unknown>;
  onRemoveLabel: (labelId: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onArchive?: (id: string) => void;
  onToggleDetails?: () => void;
};

export const ChatHeader = ({
  conversation,
  labels,
  onAddLabel,
  onRemoveLabel,
  onTogglePin,
  onArchive,
  onToggleDetails,
}: ChatHeaderProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const displayName =
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const showPhone =
    displayName !== conversation.leadPhoneNumber;

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleTogglePin = useCallback(() => {
    onTogglePin?.(conversation.id, !conversation.isPinned);
  }, [conversation.id, conversation.isPinned, onTogglePin]);

  const handleArchive = useCallback(() => {
    onArchive?.(conversation.id);
  }, [conversation.id, onArchive]);

  return (
    <StyledContainer>
      <StyledTopRow>
        <StyledLeft>
          <StyledAvatar>{initials || '?'}</StyledAvatar>
          <StyledInfo>
            <StyledName>{displayName}</StyledName>
            {showPhone && (
              <StyledPhone>{conversation.leadPhoneNumber}</StyledPhone>
            )}
          </StyledInfo>
        </StyledLeft>
        <StyledRight>
          {onTogglePin && (
            <StyledIconButton onClick={handleTogglePin} title="Toggle pin">
              {conversation.isPinned ? (
                <IconPinnedOff size={18} />
              ) : (
                <IconPinned size={18} />
              )}
            </StyledIconButton>
          )}
          {onArchive && (
            <StyledIconButton onClick={handleArchive} title="Archive">
              <IconArchive size={18} />
            </StyledIconButton>
          )}
          {onToggleDetails && (
            <StyledIconButton onClick={onToggleDetails} title="Contact details">
              <IconUser size={18} />
            </StyledIconButton>
          )}
        </StyledRight>
      </StyledTopRow>
      <StyledLabelsRow>
        {labels.map((label) => (
          <LabelBadge
            key={label.id}
            label={label}
            onRemove={onRemoveLabel}
          />
        ))}
        <div style={{ position: 'relative' }}>
          <StyledAddLabelButton
            ref={addButtonRef}
            onClick={() => setShowPicker(true)}
          >
            + Label
          </StyledAddLabelButton>
          {showPicker && (
            <LabelPicker
              existingLabels={labels}
              onAdd={onAddLabel}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>
      </StyledLabelsRow>
    </StyledContainer>
  );
};
