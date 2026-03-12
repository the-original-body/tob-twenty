import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import {
  IconArchive,
  IconBriefcase,
  IconCheck,
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

const StyledItem = styled.div<{ isSelected: boolean }>`
  align-items: flex-start;
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ isSelected, theme }) =>
    isSelected
      ? `${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(3)}`
      : `${theme.spacing(2)} ${theme.spacing(3)}`};
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

const StyledNameRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const StyledName = styled.span<{ isUnread?: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ isUnread, theme }) =>
    isUnread ? theme.font.weight.semiBold : theme.font.weight.medium};
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

const StyledNeedsReplyDot = styled.div`
  background: ${({ theme }) => theme.color.orange};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`;

const StyledPinIcon = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
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

const StyledTagsRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  margin-top: 1px;
`;

const StyledContractPipeline = styled.div`
  align-items: center;
  display: flex;
  gap: 2px;
`;

const StyledPipelineStep = styled.div<{ active: boolean }>`
  background: ${({ active, theme }) =>
    active ? theme.color.green + '30' : theme.background.transparent.lighter};
  border-radius: 2px;
  color: ${({ active, theme }) =>
    active ? theme.color.green : theme.font.color.light};
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1;
  padding: 2px 3px;
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

// ── Expanded detail styles ──────────────────────────────────────

const StyledExpandedDetail = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  margin-top: ${({ theme }) => theme.spacing(1.5)};
  padding-top: ${({ theme }) => theme.spacing(2)};
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
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  min-width: 52px;
`;

const StyledDetailValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
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
  const showNeedsReply = needsReply && !conversation.isUnread;

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
      // Adjust position to avoid going off-screen
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
        <StyledAvatar isClient={conversation.isClient}>
          {getInitials(conversation)}
          {(conversation.messageCount ?? 0) > 0 && (
            <StyledMessageCount>{conversation.messageCount}</StyledMessageCount>
          )}
        </StyledAvatar>

        <StyledContent>
          <StyledTopRow>
            <StyledNameRow>
              <StyledName isUnread={conversation.isUnread}>
                {displayName}
              </StyledName>
              {programColor && program && (
                <StyledProgramBadge bg={programColor.bg} text={programColor.text}>
                  {program}
                  {duration ? ` ${duration}` : ''}
                </StyledProgramBadge>
              )}
            </StyledNameRow>
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
              {showNeedsReply && <StyledNeedsReplyDot />}
            </StyledBadges>
          </StyledBottomRow>

          {hasPipeline && (
            <StyledTagsRow>
              <StyledContractPipeline>
                <StyledPipelineStep
                  active={!!conversation.completedStrukturanalyse}
                >
                  SA
                </StyledPipelineStep>
                <StyledPipelineStep active={!!conversation.contractSent}>
                  SENT
                </StyledPipelineStep>
                <StyledPipelineStep active={!!conversation.contractViewed}>
                  VIEW
                </StyledPipelineStep>
                <StyledPipelineStep active={!!conversation.contractIsSigned}>
                  SIGN
                </StyledPipelineStep>
              </StyledContractPipeline>
            </StyledTagsRow>
          )}

          {isSelected && (
            <StyledExpandedDetail>
              {/* Phone */}
              <StyledDetailRow>
                <StyledDetailIcon>
                  <IconPhone size={14} />
                </StyledDetailIcon>
                <StyledDetailLabel>Phone</StyledDetailLabel>
                <StyledDetailValue>
                  {conversation.leadPhoneNumber}
                </StyledDetailValue>
              </StyledDetailRow>

              {/* Email */}
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

              {/* Owner */}
              <StyledDetailRow>
                <StyledDetailIcon>
                  <IconUser size={14} />
                </StyledDetailIcon>
                <StyledDetailLabel>Owner</StyledDetailLabel>
                <StyledDetailValue>
                  {conversation.assignedToName || 'Unassigned'}
                </StyledDetailValue>
              </StyledDetailRow>

              {/* Coach */}
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

              {/* Close Lead Status */}
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

              {/* Close Link */}
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

              {/* Contract Pipeline (larger version when expanded) */}
              {hasPipeline && (
                <StyledDetailRow>
                  <StyledDetailIcon>
                    <IconCheck size={14} />
                  </StyledDetailIcon>
                  <StyledDetailLabel>Contract</StyledDetailLabel>
                  <StyledContractPipeline>
                    <StyledPipelineStep
                      active={!!conversation.completedStrukturanalyse}
                    >
                      Strukturanalyse
                    </StyledPipelineStep>
                    <StyledPipelineStep active={!!conversation.contractSent}>
                      Sent
                    </StyledPipelineStep>
                    <StyledPipelineStep active={!!conversation.contractViewed}>
                      Viewed
                    </StyledPipelineStep>
                    <StyledPipelineStep active={!!conversation.contractIsSigned}>
                      Signed
                    </StyledPipelineStep>
                  </StyledContractPipeline>
                </StyledDetailRow>
              )}

              {/* Message count */}
              {(conversation.messageCount ?? 0) > 0 && (
                <StyledDetailRow>
                  <StyledDetailIcon>
                    <IconSend size={14} />
                  </StyledDetailIcon>
                  <StyledDetailLabel>Messages</StyledDetailLabel>
                  <StyledDetailValue>
                    {conversation.messageCount}
                  </StyledDetailValue>
                </StyledDetailRow>
              )}
            </StyledExpandedDetail>
          )}
        </StyledContent>
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
