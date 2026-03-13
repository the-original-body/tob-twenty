import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import {
  IconArchive,
  IconBriefcase,
  IconMail,
  IconPhone,
  IconPinned,
  IconPinnedOff,
  IconSend,
  IconUser,
  IconUsers,
} from 'twenty-ui/display';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';

// ── Program colors ──────────────────────────────────────────────

const PROGRAM_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  JP: { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
  BPA: { bg: '#cffafe', border: '#67e8f9', text: '#0e7490' },
  BPE: { bg: '#e0e7ff', border: '#a5b4fc', text: '#4338ca' },
  CERT: { bg: '#d1fae5', border: '#6ee7b7', text: '#047857' },
  Alumni: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
  Canceled: { bg: '#ffe4e6', border: '#fda4af', text: '#be123c' },
  Lead: { bg: '#f5f5f4', border: '#d6d3d1', text: '#78716c' },
};

// ── Pipeline step icons (SVG paths for SA/SENT/VIEW/SIGN) ──────

const PIPELINE_ICONS = {
  SA: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4v16" /><path d="M17 4v16" /><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13" />
    </svg>
  ),
  SENT: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  VIEW: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  SIGN: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  ),
};

// ── Styled components ───────────────────────────────────────────

const StyledItem = styled.div<{ isSelected: boolean }>`
  background: ${({ isSelected }) =>
    isSelected ? 'rgba(29, 78, 216, 0.10)' : 'transparent'};
  border-left: 3px solid ${({ isSelected }) =>
    isSelected ? 'rgba(29, 78, 216, 0.7)' : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(3)};
  transition: background 120ms ease, border-color 120ms ease;

  &:hover {
    background: ${({ isSelected }) =>
      isSelected ? 'rgba(29, 78, 216, 0.10)' : 'rgba(255, 255, 255, 0.04)'};
  }
`;

const StyledCompactRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledAvatar = styled.div<{ isClient?: boolean }>`
  align-items: center;
  background: ${({ isClient }) =>
    isClient ? '#2563eb' : 'rgba(255, 255, 255, 0.10)'};
  border: 1px solid ${({ isClient }) =>
    isClient ? 'rgba(37, 99, 235, 0.5)' : 'rgba(255, 255, 255, 0.12)'};
  border-radius: 50%;
  color: ${({ isClient }) =>
    isClient ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 40px;
  justify-content: center;
  position: relative;
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

const StyledNameGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;

const StyledName = styled.span<{ isUnread?: boolean }>`
  color: ${({ isUnread }) =>
    isUnread ? '#f0f0f0' : 'rgba(255, 255, 255, 0.85)'};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ isUnread, theme }) =>
    isUnread ? theme.font.weight.semiBold : theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledNeedsReplyDot = styled.div`
  background: ${({ theme }) => theme.color.orange};
  border-radius: 50%;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const StyledRightGroup = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledProgramBadge = styled.span<{ bg: string; border: string; text: string }>`
  background: ${({ bg }) => bg};
  border: 1px solid ${({ border }) => border};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ text }) => text};
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 3px 8px;
  white-space: nowrap;
`;

const StyledTimestamp = styled.span<{ isUnread?: boolean }>`
  color: ${({ isUnread }) =>
    isUnread ? '#60a5fa' : 'rgba(255, 255, 255, 0.35)'};
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
  color: ${({ isUnread }) =>
    isUnread ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)'};
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

const StyledMessageCount = styled.span`
  background: ${({ theme }) => theme.background.transparent.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  min-width: 20px;
  padding: 1px 6px;
  position: absolute;
  bottom: -4px;
  right: -4px;
  text-align: center;
`;

// ── Visual pipeline (circles + connecting lines) ────────────────

const StyledPipelineContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: 0;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(3)};
`;

const StyledPipelineStepWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1;
`;

const StyledPipelineCircle = styled.div<{ active: boolean }>`
  align-items: center;
  background: ${({ active }) => (active ? 'rgba(34, 197, 94, 0.12)' : 'transparent')};
  border: 2px solid ${({ active }) =>
    active ? '#22c55e' : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 50%;
  color: ${({ active }) =>
    active ? '#22c55e' : 'rgba(255, 255, 255, 0.25)'};
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const StyledPipelineLine = styled.div<{ active: boolean }>`
  background: ${({ active }) =>
    active ? '#22c55e' : 'rgba(255, 255, 255, 0.12)'};
  flex: 1;
  height: 2px;
  margin-bottom: 20px;
`;

const StyledPipelineLabel = styled.span<{ active: boolean }>`
  color: ${({ active }) =>
    active ? '#22c55e' : 'rgba(255, 255, 255, 0.3)'};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

// ── Expanded detail styles ──────────────────────────────────────

const StyledExpandedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailIcon = styled.span`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-shrink: 0;
  width: 16px;
`;

const StyledDetailLabel = styled.span`
  color: rgba(255, 255, 255, 0.45);
  font-size: ${({ theme }) => theme.font.size.xs};
  min-width: 52px;
`;

const StyledDetailValue = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: ${({ theme }) => theme.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDetailLink = styled.a`
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.xs};
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledLeadStatusBadge = styled.span<{ statusType?: string }>`
  background: ${({ statusType }) => {
    switch (statusType) {
      case 'active':
        return '#dbeafe';
      case 'won':
        return '#d1fae5';
      case 'lost':
        return '#ffe4e6';
      default:
        return '#f1f5f9';
    }
  }};
  border-radius: 3px;
  color: ${({ statusType }) => {
    switch (statusType) {
      case 'active':
        return '#1d4ed8';
      case 'won':
        return '#047857';
      case 'lost':
        return '#be123c';
      default:
        return '#475569';
    }
  }};
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  padding: 2px 5px;
`;

// ── Compact pipeline (shown when not selected) ──────────────────

const StyledCompactPipeline = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
  margin-top: 1px;
`;

const StyledCompactStep = styled.div<{ active: boolean }>`
  background: ${({ active }) =>
    active ? 'rgba(34, 197, 94, 0.20)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 2px;
  color: ${({ active }) =>
    active ? '#4ade80' : 'rgba(255, 255, 255, 0.25)'};
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1;
  padding: 2px 3px;
`;

// ── Context menu styles ─────────────────────────────────────────

const StyledContextOverlay = styled.div`
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;
`;

const StyledContextMenu = styled.div<{ x: number; y: number }>`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  left: ${({ x }) => x}px;
  min-width: 180px;
  padding: ${({ theme }) => theme.spacing(1)};
  position: fixed;
  top: ${({ y }) => y}px;
  z-index: 101;
`;

const StyledContextMenuItem = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledMenuIconWrapper = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

// ── Helpers ─────────────────────────────────────────────────────

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

// ── Sub-components ──────────────────────────────────────────────

const VisualPipeline = ({ conversation }: { conversation: WaConversation }) => {
  const steps = [
    { key: 'SA', active: !!conversation.completedStrukturanalyse },
    { key: 'SENT', active: !!conversation.contractSent },
    { key: 'VIEW', active: !!conversation.contractViewed },
    { key: 'SIGN', active: !!conversation.contractIsSigned },
  ] as const;

  return (
    <StyledPipelineContainer>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: 'contents' }}>
          {i > 0 && (
            <StyledPipelineLine active={step.active} />
          )}
          <StyledPipelineStepWrapper>
            <StyledPipelineCircle active={step.active}>
              {PIPELINE_ICONS[step.key]}
            </StyledPipelineCircle>
            <StyledPipelineLabel active={step.active}>
              {step.key}
            </StyledPipelineLabel>
          </StyledPipelineStepWrapper>
        </div>
      ))}
    </StyledPipelineContainer>
  );
};

// ── Component ───────────────────────────────────────────────────

type ConversationListItemProps = {
  conversation: WaConversation;
  isSelected: boolean;
  onClick: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onArchive?: (id: string) => void;
  onToggleRead?: (id: string, isUnread: boolean) => void;
};

export const ConversationListItem = ({
  conversation,
  isSelected,
  onClick,
  onTogglePin,
  onArchive,
  onToggleRead,
}: ConversationListItemProps) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const displayName =
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const previewPrefix = conversation.lastMessageFromAgent ? 'You: ' : '';

  const needsReply = !conversation.lastMessageFromAgent;

  const program = conversation.justusProgram;
  const duration = conversation.justusDuration;
  const programColor = program ? PROGRAM_COLORS[program] : undefined;

  const hasPipeline =
    conversation.completedStrukturanalyse !== undefined ||
    conversation.contractSent !== undefined ||
    conversation.contractViewed !== undefined ||
    conversation.contractIsSigned !== undefined;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const x = Math.min(e.clientX, window.innerWidth - 200);
      const y = Math.min(e.clientY, window.innerHeight - 200);
      setContextMenu({ x, y });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <>
      <StyledItem
        isSelected={isSelected}
        onClick={() => onClick(conversation.id)}
        onContextMenu={handleContextMenu}
      >
        {/* ── Compact row (always visible) ── */}
        <StyledCompactRow>
          <StyledAvatar isClient={conversation.isClient}>
            {getInitials(conversation)}
            {(conversation.messageCount ?? 0) > 0 && (
              <StyledMessageCount>{conversation.messageCount}</StyledMessageCount>
            )}
          </StyledAvatar>

          <StyledContent>
            <StyledTopRow>
              <StyledNameGroup>
                <StyledName isUnread={conversation.isUnread}>
                  {displayName}
                </StyledName>
                {needsReply && <StyledNeedsReplyDot />}
              </StyledNameGroup>
              <StyledRightGroup>
                {programColor && program && (
                  <StyledProgramBadge
                    bg={programColor.bg}
                    border={programColor.border}
                    text={programColor.text}
                  >
                    {program}
                    {duration ? ` ${duration}` : ''}
                  </StyledProgramBadge>
                )}
                <StyledTimestamp isUnread={conversation.isUnread}>
                  {formatTimestamp(conversation.lastMessageAt)}
                </StyledTimestamp>
              </StyledRightGroup>
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

            {/* Compact pipeline badges (when not selected) */}
            {hasPipeline && !isSelected && (
              <StyledCompactPipeline>
                <StyledCompactStep active={!!conversation.completedStrukturanalyse}>
                  SA
                </StyledCompactStep>
                <StyledCompactStep active={!!conversation.contractSent}>
                  SENT
                </StyledCompactStep>
                <StyledCompactStep active={!!conversation.contractViewed}>
                  VIEW
                </StyledCompactStep>
                <StyledCompactStep active={!!conversation.contractIsSigned}>
                  SIGN
                </StyledCompactStep>
              </StyledCompactPipeline>
            )}
          </StyledContent>
        </StyledCompactRow>

        {/* ── Expanded section (selected only) ── */}
        {isSelected && (
          <>
            <StyledExpandedSection>
              <StyledDetailRow>
                <StyledDetailIcon>
                  <IconPhone size={14} />
                </StyledDetailIcon>
                <StyledDetailLabel>Phone</StyledDetailLabel>
                <StyledDetailValue>
                  {conversation.leadPhoneNumber}
                </StyledDetailValue>
              </StyledDetailRow>

              {conversation.contactEmail && (
                <StyledDetailRow>
                  <StyledDetailIcon>
                    <IconMail size={14} />
                  </StyledDetailIcon>
                  <StyledDetailLabel>Email</StyledDetailLabel>
                  <StyledDetailValue>
                    {conversation.contactEmail}
                  </StyledDetailValue>
                </StyledDetailRow>
              )}

              <StyledDetailRow>
                <StyledDetailIcon>
                  <IconUser size={14} />
                </StyledDetailIcon>
                <StyledDetailLabel>Owner</StyledDetailLabel>
                <StyledDetailValue>
                  {conversation.assignedToName || 'Unassigned'}
                </StyledDetailValue>
              </StyledDetailRow>

              {conversation.coachLeadOwnerName && (
                <StyledDetailRow>
                  <StyledDetailIcon>
                    <IconUsers size={14} />
                  </StyledDetailIcon>
                  <StyledDetailLabel>Coach</StyledDetailLabel>
                  <StyledDetailValue>
                    {conversation.coachLeadOwnerName}
                  </StyledDetailValue>
                </StyledDetailRow>
              )}

              {conversation.closeLeadStatus && (
                <StyledDetailRow>
                  <StyledDetailIcon>
                    <IconBriefcase size={14} />
                  </StyledDetailIcon>
                  <StyledDetailLabel>Lead</StyledDetailLabel>
                  <StyledLeadStatusBadge
                    statusType={
                      conversation.closeLeadStatus.toLowerCase().includes('won')
                        ? 'won'
                        : conversation.closeLeadStatus
                              .toLowerCase()
                              .includes('lost')
                          ? 'lost'
                          : 'active'
                    }
                  >
                    {conversation.closeLeadStatus}
                  </StyledLeadStatusBadge>
                </StyledDetailRow>
              )}

              {conversation.closeLeadUrl && (
                <StyledDetailRow>
                  <StyledDetailIcon>
                    <IconSend size={14} />
                  </StyledDetailIcon>
                  <StyledDetailLabel>Close</StyledDetailLabel>
                  <StyledDetailLink
                    href={conversation.closeLeadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open in Close
                  </StyledDetailLink>
                </StyledDetailRow>
              )}
            </StyledExpandedSection>

            {/* Visual pipeline (Foundry-style circles + lines) */}
            {hasPipeline && <VisualPipeline conversation={conversation} />}
          </>
        )}
      </StyledItem>

      {contextMenu && (
        <>
          <StyledContextOverlay onClick={closeContextMenu} />
          <StyledContextMenu x={contextMenu.x} y={contextMenu.y}>
            {onTogglePin && (
              <StyledContextMenuItem
                onClick={() => {
                  onTogglePin(conversation.id, !conversation.isPinned);
                  closeContextMenu();
                }}
              >
                <StyledMenuIconWrapper>
                  {conversation.isPinned ? (
                    <IconPinnedOff size={16} />
                  ) : (
                    <IconPinned size={16} />
                  )}
                </StyledMenuIconWrapper>
                {conversation.isPinned ? 'Unpin' : 'Pin conversation'}
              </StyledContextMenuItem>
            )}

            {onToggleRead && (
              <StyledContextMenuItem
                onClick={() => {
                  onToggleRead(
                    conversation.id,
                    !conversation.isUnread,
                  );
                  closeContextMenu();
                }}
              >
                <StyledMenuIconWrapper>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: conversation.isUnread
                          ? 'transparent'
                          : 'currentColor',
                        border: conversation.isUnread
                          ? '2px solid currentColor'
                          : 'none',
                      }}
                    />
                  </div>
                </StyledMenuIconWrapper>
                {conversation.isUnread ? 'Mark as read' : 'Mark as unread'}
              </StyledContextMenuItem>
            )}

            {onArchive && (
              <StyledContextMenuItem
                onClick={() => {
                  onArchive(conversation.id);
                  closeContextMenu();
                }}
              >
                <StyledMenuIconWrapper>
                  <IconArchive size={16} />
                </StyledMenuIconWrapper>
                Archive
              </StyledContextMenuItem>
            )}
          </StyledContextMenu>
        </>
      )}
    </>
  );
};
