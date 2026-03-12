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

// ── Program colors (same as ConversationListItem) ───────────────

const PROGRAM_COLORS: Record<string, { bg: string; text: string }> = {
  JP: { bg: '#dbeafe', text: '#1d4ed8' },
  BPA: { bg: '#cffafe', text: '#0e7490' },
  BPE: { bg: '#e0e7ff', text: '#4338ca' },
  CERT: { bg: '#d1fae5', text: '#047857' },
  Alumni: { bg: '#f1f5f9', text: '#475569' },
  Canceled: { bg: '#ffe4e6', text: '#be123c' },
  Lead: { bg: '#f5f5f4', text: '#78716c' },
};

// ── Styled components ───────────────────────────────────────────

const StyledContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StyledTopRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3)}
    0;
`;

const StyledLeft = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  min-width: 0;
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

const StyledInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPhoneRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledPhone = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledProgramBadge = styled.span<{ bg: string; text: string }>`
  background: ${({ bg }) => bg};
  border-radius: 3px;
  color: ${({ text }) => text};
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  padding: 2px 5px;
  white-space: nowrap;
`;

const StyledOwnerLine = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const StyledCloseButton = styled.a`
  align-items: center;
  background: none;
  border: 1px solid ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.color.blue};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  height: 32px;
  line-height: 1;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.font.color.inverted};
  }
`;

const StyledLabelsRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)}
    ${({ theme }) => theme.spacing(2)};
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

// ── Component ───────────────────────────────────────────────────

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

  const showPhone = displayName !== conversation.leadPhoneNumber;

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const program = conversation.justusProgram;
  const duration = conversation.justusDuration;
  const programColor = program ? PROGRAM_COLORS[program] : undefined;

  const ownerName = conversation.assignedToName || 'Unassigned';
  const coachName = conversation.coachLeadOwnerName || 'None';

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
          <StyledAvatar isClient={conversation.isClient}>
            {initials || '?'}
          </StyledAvatar>
          <StyledInfo>
            <StyledName>{displayName}</StyledName>
            {showPhone && (
              <StyledPhoneRow>
                <StyledPhone>{conversation.leadPhoneNumber}</StyledPhone>
                {programColor && program && (
                  <StyledProgramBadge
                    bg={programColor.bg}
                    text={programColor.text}
                  >
                    {program}
                    {duration ? ` ${duration}` : ''}
                  </StyledProgramBadge>
                )}
              </StyledPhoneRow>
            )}
            {!showPhone && programColor && program && (
              <StyledPhoneRow>
                <StyledProgramBadge
                  bg={programColor.bg}
                  text={programColor.text}
                >
                  {program}
                  {duration ? ` ${duration}` : ''}
                </StyledProgramBadge>
              </StyledPhoneRow>
            )}
            <StyledOwnerLine>
              Owner: {ownerName} &middot; Coach: {coachName}
            </StyledOwnerLine>
          </StyledInfo>
        </StyledLeft>
        <StyledRight>
          {conversation.closeLeadUrl && (
            <StyledCloseButton
              href={conversation.closeLeadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Call in Close
            </StyledCloseButton>
          )}
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
            <StyledIconButton
              onClick={onToggleDetails}
              title="Contact details"
            >
              <IconUser size={18} />
            </StyledIconButton>
          )}
        </StyledRight>
      </StyledTopRow>
      <StyledLabelsRow>
        {labels.map((label) => (
          <LabelBadge key={label.id} label={label} onRemove={onRemoveLabel} />
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
