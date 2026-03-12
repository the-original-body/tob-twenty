import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { IconX } from 'twenty-ui/display';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { useContact } from '@/whatsapp-chat/hooks/useContact';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';

// ── Styled components ───────────────────────────────────────────

const StyledContainer = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 320px;
  width: 320px;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: space-between;
  min-height: 56px;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledTabs = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: 0;
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ isActive, theme }) =>
      isActive ? theme.color.blue : 'transparent'};
  color: ${({ isActive, theme }) =>
    isActive ? theme.color.blue : theme.font.color.tertiary};
  cursor: pointer;
  flex: 1;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(1)};
  transition: all 120ms ease;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledAvatar = styled.div<{ isClient?: boolean }>`
  align-items: center;
  align-self: center;
  background: ${({ isClient, theme }) =>
    isClient ? theme.color.blue : theme.background.transparent.medium};
  border-radius: 50%;
  color: ${({ isClient, theme }) =>
    isClient ? theme.font.color.inverted : theme.font.color.secondary};
  display: flex;
  font-size: 24px;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 72px;
  justify-content: center;
  width: 72px;
`;

const StyledContactName = styled.div`
  align-self: center;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-align: center;
`;

const StyledContactSubtext = styled.div`
  align-self: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: center;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledFieldLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledFieldValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  word-break: break-word;
`;

const StyledBadge = styled.span<{
  variant: 'success' | 'warning' | 'neutral' | 'danger' | 'info';
}>`
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.color.green + '20';
      case 'warning':
        return theme.color.orange + '20';
      case 'danger':
        return theme.color.red + '20';
      case 'info':
        return theme.color.blue + '20';
      default:
        return theme.background.transparent.lighter;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.color.green;
      case 'warning':
        return theme.color.orange;
      case 'danger':
        return theme.color.red;
      case 'info':
        return theme.color.blue;
      default:
        return theme.font.color.secondary;
    }
  }};
  display: inline-block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 2px 8px;
  width: fit-content;
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAssignInput = styled.input`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  outline: none;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledAssignButton = styled.button`
  background: ${({ theme }) => theme.color.blue};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.inverted};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  &:hover {
    opacity: 0.9;
  }
`;

const StyledLoadingText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-style: italic;
`;

const StyledDivider = styled.div`
  background: ${({ theme }) => theme.border.color.light};
  height: 1px;
  width: 100%;
`;

const StyledPipelineRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPipelineStep = styled.div<{ active: boolean }>`
  align-items: center;
  background: ${({ active, theme }) =>
    active ? theme.color.green + '20' : theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ active, theme }) =>
    active ? theme.color.green : theme.font.color.light};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 10px;
  font-weight: 600;
  gap: 2px;
  padding: ${({ theme }) => theme.spacing(1)};
  text-align: center;
`;

const StyledPipelineConnector = styled.div<{ active: boolean }>`
  background: ${({ active, theme }) =>
    active ? theme.color.green : theme.border.color.light};
  height: 2px;
  width: 8px;
`;

// ── Helpers ─────────────────────────────────────────────────────

const formatDate = (isoString: string | null): string => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

type TabId = 'profile' | 'conversation' | 'assignment';

// ── Component ───────────────────────────────────────────────────

type ConversationDetailsProps = {
  conversation: WaConversation;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<WaConversation>) => void;
};

export const ConversationDetails = ({
  conversation,
  onClose,
  onUpdate,
}: ConversationDetailsProps) => {
  const { bridgeFetch } = useWhatsAppBridge();
  const { contact, loading: contactLoading } = useContact(
    conversation.leadPhoneNumber,
  );
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [assignEmail, setAssignEmail] = useState(
    conversation.assignedToEmail ?? '',
  );

  const displayName =
    contact?.fullName ||
    conversation.leadFullName ||
    conversation.whatsappName ||
    conversation.leadPhoneNumber;

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isClient = contact?.isClient || conversation.isClient;

  const handleAssign = useCallback(async () => {
    const trimmedEmail = assignEmail.trim();
    if (!trimmedEmail) return;

    try {
      await bridgeFetch(`/api/v1/conversations/${conversation.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ assigned_to_email: trimmedEmail }),
      });
      onUpdate?.(conversation.id, { assignedToEmail: trimmedEmail });
    } catch {
      // Silently fail
    }
  }, [bridgeFetch, conversation.id, assignEmail, onUpdate]);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>Details</StyledTitle>
        <StyledCloseButton onClick={onClose}>
          <IconX size={16} />
        </StyledCloseButton>
      </StyledHeader>

      <StyledTabs>
        <StyledTab
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'conversation'}
          onClick={() => setActiveTab('conversation')}
        >
          Conversation
        </StyledTab>
        <StyledTab
          isActive={activeTab === 'assignment'}
          onClick={() => setActiveTab('assignment')}
        >
          Assignment
        </StyledTab>
      </StyledTabs>

      <StyledBody>
        {/* Avatar + Name always visible */}
        <StyledAvatar isClient={isClient}>{initials || '?'}</StyledAvatar>
        <StyledContactName>{displayName}</StyledContactName>
        {conversation.leadPhoneNumber !== displayName && (
          <StyledContactSubtext>
            {conversation.leadPhoneNumber}
          </StyledContactSubtext>
        )}

        {contactLoading && (
          <StyledLoadingText>Loading contact data...</StyledLoadingText>
        )}

        {/* ── Profile Tab ──────────────────────────────────── */}
        {activeTab === 'profile' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Contact Info</StyledSectionTitle>
              <StyledField>
                <StyledFieldLabel>Phone</StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.leadPhoneNumber}
                </StyledFieldValue>
              </StyledField>
              {conversation.whatsappName && (
                <StyledField>
                  <StyledFieldLabel>WhatsApp Name</StyledFieldLabel>
                  <StyledFieldValue>
                    {conversation.whatsappName}
                  </StyledFieldValue>
                </StyledField>
              )}
              {contact?.email && (
                <StyledField>
                  <StyledFieldLabel>Email</StyledFieldLabel>
                  <StyledFieldValue>{contact.email}</StyledFieldValue>
                </StyledField>
              )}
              {contact?.country && (
                <StyledField>
                  <StyledFieldLabel>Country</StyledFieldLabel>
                  <StyledFieldValue>{contact.country}</StyledFieldValue>
                </StyledField>
              )}
              {contact?.source && (
                <StyledField>
                  <StyledFieldLabel>Source</StyledFieldLabel>
                  <StyledFieldValue>{contact.source}</StyledFieldValue>
                </StyledField>
              )}
            </StyledSection>

            <StyledDivider />

            {contact && (
              <>
                <StyledSection>
                  <StyledSectionTitle>Client Status</StyledSectionTitle>
                  <StyledBadgeRow>
                    {contact.isClient && (
                      <StyledBadge variant="success">Bexio Client</StyledBadge>
                    )}
                    {contact.isActiveMainProgramClient && (
                      <StyledBadge variant="success">Active LZR</StyledBadge>
                    )}
                    {contact.isMainProgramClient &&
                      !contact.isActiveMainProgramClient && (
                        <StyledBadge variant="neutral">
                          Main Program
                        </StyledBadge>
                      )}
                    {contact.isTrainingCertClient && (
                      <StyledBadge variant="neutral">Training Cert</StyledBadge>
                    )}
                    {contact.isFinishingLzr30Days && (
                      <StyledBadge variant="warning">
                        Finishing in 30d
                      </StyledBadge>
                    )}
                    {!contact.isClient && !contact.isMainProgramClient && (
                      <StyledBadge variant="neutral">Lead</StyledBadge>
                    )}
                  </StyledBadgeRow>
                  {contact.bexioClientId && (
                    <StyledField>
                      <StyledFieldLabel>Bexio ID</StyledFieldLabel>
                      <StyledFieldValue>
                        {contact.bexioClientId}
                      </StyledFieldValue>
                    </StyledField>
                  )}
                </StyledSection>

                <StyledSection>
                  <StyledSectionTitle>Contract Pipeline</StyledSectionTitle>
                  <StyledPipelineRow>
                    <StyledPipelineStep
                      active={!!contact.contractIsSigned || !!contact.pandadocIsSigned || !!contact.docusealIsSigned}
                    >
                      SA
                    </StyledPipelineStep>
                    <StyledPipelineConnector
                      active={!!contact.pandadocIsSigned || !!contact.docusealIsSigned}
                    />
                    <StyledPipelineStep
                      active={!!contact.pandadocIsSigned || !!contact.docusealIsSigned}
                    >
                      SENT
                    </StyledPipelineStep>
                    <StyledPipelineConnector
                      active={!!contact.pandadocIsSigned || !!contact.docusealIsSigned}
                    />
                    <StyledPipelineStep
                      active={!!contact.pandadocIsSigned || !!contact.docusealIsSigned}
                    >
                      VIEW
                    </StyledPipelineStep>
                    <StyledPipelineConnector
                      active={!!contact.contractIsSigned}
                    />
                    <StyledPipelineStep active={!!contact.contractIsSigned}>
                      SIGN
                    </StyledPipelineStep>
                  </StyledPipelineRow>
                  <StyledBadgeRow>
                    {contact.pandadocIsSigned && (
                      <StyledBadge variant="success">PandaDoc</StyledBadge>
                    )}
                    {contact.docusealIsSigned && (
                      <StyledBadge variant="success">DocuSeal</StyledBadge>
                    )}
                  </StyledBadgeRow>
                </StyledSection>

                {(contact.lzrStartDate || contact.lzrEndDate) && (
                  <StyledSection>
                    <StyledSectionTitle>LZR Program</StyledSectionTitle>
                    {contact.lzrStartDate && (
                      <StyledField>
                        <StyledFieldLabel>Start Date</StyledFieldLabel>
                        <StyledFieldValue>
                          {formatDate(contact.lzrStartDate)}
                        </StyledFieldValue>
                      </StyledField>
                    )}
                    {contact.lzrEndDate && (
                      <StyledField>
                        <StyledFieldLabel>End Date</StyledFieldLabel>
                        <StyledFieldValue>
                          {formatDate(contact.lzrEndDate)}
                        </StyledFieldValue>
                      </StyledField>
                    )}
                    {contact.lzrMonthDuration && (
                      <StyledField>
                        <StyledFieldLabel>Duration</StyledFieldLabel>
                        <StyledFieldValue>
                          {contact.lzrMonthDuration} months
                        </StyledFieldValue>
                      </StyledField>
                    )}
                  </StyledSection>
                )}
              </>
            )}

            {!contact && !contactLoading && (
              <StyledSection>
                <StyledSectionTitle>Status</StyledSectionTitle>
                <StyledBadgeRow>
                  <StyledBadge
                    variant={conversation.isClient ? 'success' : 'neutral'}
                  >
                    {conversation.isClient ? 'Client' : 'Lead'}
                  </StyledBadge>
                </StyledBadgeRow>
              </StyledSection>
            )}
          </>
        )}

        {/* ── Conversation Tab ─────────────────────────────── */}
        {activeTab === 'conversation' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Stats</StyledSectionTitle>
              <StyledField>
                <StyledFieldLabel>Messages</StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.messageCount ?? 'Unknown'}
                </StyledFieldValue>
              </StyledField>
              <StyledField>
                <StyledFieldLabel>Session</StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.sessionName}
                </StyledFieldValue>
              </StyledField>
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Status</StyledSectionTitle>
              <StyledBadgeRow>
                {conversation.isPinned && (
                  <StyledBadge variant="info">Pinned</StyledBadge>
                )}
                {conversation.isArchived && (
                  <StyledBadge variant="neutral">Archived</StyledBadge>
                )}
                {conversation.isUnread && (
                  <StyledBadge variant="warning">Unread</StyledBadge>
                )}
                {!conversation.lastMessageFromAgent && (
                  <StyledBadge variant="danger">Needs reply</StyledBadge>
                )}
                {conversation.lastMessageFromAgent && (
                  <StyledBadge variant="success">Replied</StyledBadge>
                )}
              </StyledBadgeRow>
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Last Message</StyledSectionTitle>
              <StyledField>
                <StyledFieldLabel>
                  {conversation.lastMessageFromAgent ? 'You' : 'Contact'}
                </StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.lastMessageBody || '—'}
                </StyledFieldValue>
              </StyledField>
              <StyledField>
                <StyledFieldLabel>Time</StyledFieldLabel>
                <StyledFieldValue>
                  {formatDate(conversation.lastMessageAt)}
                </StyledFieldValue>
              </StyledField>
            </StyledSection>
          </>
        )}

        {/* ── Assignment Tab ───────────────────────────────── */}
        {activeTab === 'assignment' && (
          <>
            <StyledSection>
              <StyledSectionTitle>Owner</StyledSectionTitle>
              {(contact?.tobAssignedName || conversation.assignedToName) && (
                <StyledField>
                  <StyledFieldLabel>Currently assigned to</StyledFieldLabel>
                  <StyledFieldValue>
                    {contact?.tobAssignedName || conversation.assignedToName}
                  </StyledFieldValue>
                </StyledField>
              )}
              {(contact?.tobAssignedEmail ||
                conversation.assignedToEmail) && (
                <StyledField>
                  <StyledFieldLabel>Email</StyledFieldLabel>
                  <StyledFieldValue>
                    {contact?.tobAssignedEmail || conversation.assignedToEmail}
                  </StyledFieldValue>
                </StyledField>
              )}
              {!contact?.tobAssignedName && !conversation.assignedToName && (
                <StyledBadge variant="neutral">Unassigned</StyledBadge>
              )}
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Reassign</StyledSectionTitle>
              <StyledAssignInput
                type="email"
                placeholder="Assign to email..."
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAssign();
                  }
                }}
              />
              <StyledAssignButton onClick={handleAssign}>
                Assign
              </StyledAssignButton>
            </StyledSection>

            <StyledDivider />

            <StyledSection>
              <StyledSectionTitle>Coach</StyledSectionTitle>
              {conversation.coachLeadOwnerName ? (
                <>
                  <StyledField>
                    <StyledFieldLabel>Name</StyledFieldLabel>
                    <StyledFieldValue>
                      {conversation.coachLeadOwnerName}
                    </StyledFieldValue>
                  </StyledField>
                  {conversation.coachLeadOwnerEmail && (
                    <StyledField>
                      <StyledFieldLabel>Email</StyledFieldLabel>
                      <StyledFieldValue>
                        {conversation.coachLeadOwnerEmail}
                      </StyledFieldValue>
                    </StyledField>
                  )}
                </>
              ) : (
                <StyledBadge variant="neutral">No coach assigned</StyledBadge>
              )}
            </StyledSection>
          </>
        )}
      </StyledBody>
    </StyledContainer>
  );
};
