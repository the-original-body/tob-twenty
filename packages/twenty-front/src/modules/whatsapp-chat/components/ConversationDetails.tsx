import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { IconX } from 'twenty-ui/display';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { useContact } from '@/whatsapp-chat/hooks/useContact';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledContainer = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 300px;
  width: 300px;
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

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledAvatar = styled.div`
  align-items: center;
  align-self: center;
  background: ${({ theme }) => theme.background.transparent.medium};
  border-radius: 50%;
  color: ${({ theme }) => theme.font.color.secondary};
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
`;

const StyledBadge = styled.span<{ variant: 'success' | 'warning' | 'neutral' | 'danger' }>`
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.color.green + '20';
      case 'warning':
        return theme.color.orange + '20';
      case 'danger':
        return theme.color.red + '20';
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
      // Silently fail — the user can retry
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

      <StyledBody>
        <StyledAvatar>{initials || '?'}</StyledAvatar>
        <StyledContactName>{displayName}</StyledContactName>

        <StyledSection>
          <StyledSectionTitle>Contact Info</StyledSectionTitle>
          <StyledField>
            <StyledFieldLabel>Phone</StyledFieldLabel>
            <StyledFieldValue>{conversation.leadPhoneNumber}</StyledFieldValue>
          </StyledField>
          {conversation.whatsappName && (
            <StyledField>
              <StyledFieldLabel>WhatsApp Name</StyledFieldLabel>
              <StyledFieldValue>{conversation.whatsappName}</StyledFieldValue>
            </StyledField>
          )}
          {(contact?.fullName || conversation.leadFullName) && (
            <StyledField>
              <StyledFieldLabel>Full Name</StyledFieldLabel>
              <StyledFieldValue>
                {contact?.fullName || conversation.leadFullName}
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
          <StyledField>
            <StyledFieldLabel>Session</StyledFieldLabel>
            <StyledFieldValue>{conversation.sessionName}</StyledFieldValue>
          </StyledField>
        </StyledSection>

        <StyledDivider />

        {contactLoading && (
          <StyledLoadingText>Loading contact data...</StyledLoadingText>
        )}

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
                {contact.isMainProgramClient && !contact.isActiveMainProgramClient && (
                  <StyledBadge variant="neutral">Main Program</StyledBadge>
                )}
                {contact.isTrainingCertClient && (
                  <StyledBadge variant="neutral">Training Cert</StyledBadge>
                )}
                {contact.isFinishingLzr30Days && (
                  <StyledBadge variant="warning">Finishing in 30d</StyledBadge>
                )}
                {!contact.isClient && !contact.isMainProgramClient && (
                  <StyledBadge variant="neutral">Not a client</StyledBadge>
                )}
              </StyledBadgeRow>
              {contact.bexioClientId && (
                <StyledField>
                  <StyledFieldLabel>Bexio ID</StyledFieldLabel>
                  <StyledFieldValue>{contact.bexioClientId}</StyledFieldValue>
                </StyledField>
              )}
            </StyledSection>

            <StyledSection>
              <StyledSectionTitle>Contract</StyledSectionTitle>
              <StyledBadgeRow>
                <StyledBadge
                  variant={contact.contractIsSigned ? 'success' : 'neutral'}
                >
                  Contract: {contact.contractIsSigned ? 'Signed' : 'Not signed'}
                </StyledBadge>
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

            <StyledDivider />
          </>
        )}

        {!contact && !contactLoading && (
          <>
            <StyledSection>
              <StyledSectionTitle>Status</StyledSectionTitle>
              <StyledField>
                <StyledFieldLabel>Client</StyledFieldLabel>
                <StyledFieldValue>
                  {conversation.isClient ? 'Yes' : 'No'}
                </StyledFieldValue>
              </StyledField>
            </StyledSection>

            <StyledDivider />
          </>
        )}

        <StyledSection>
          <StyledSectionTitle>Conversation</StyledSectionTitle>
          <StyledField>
            <StyledFieldLabel>Messages</StyledFieldLabel>
            <StyledFieldValue>
              {conversation.messageCount ?? 'Unknown'}
            </StyledFieldValue>
          </StyledField>
          <StyledField>
            <StyledFieldLabel>Pinned</StyledFieldLabel>
            <StyledFieldValue>
              {conversation.isPinned ? 'Yes' : 'No'}
            </StyledFieldValue>
          </StyledField>
          <StyledField>
            <StyledFieldLabel>Archived</StyledFieldLabel>
            <StyledFieldValue>
              {conversation.isArchived ? 'Yes' : 'No'}
            </StyledFieldValue>
          </StyledField>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Assignment</StyledSectionTitle>
          {(contact?.tobAssignedName || conversation.assignedToName) && (
            <StyledField>
              <StyledFieldLabel>Currently assigned to</StyledFieldLabel>
              <StyledFieldValue>
                {contact?.tobAssignedName || conversation.assignedToName}
              </StyledFieldValue>
            </StyledField>
          )}
          {contact?.tobAssignedEmail && (
            <StyledField>
              <StyledFieldLabel>Assigned email</StyledFieldLabel>
              <StyledFieldValue>{contact.tobAssignedEmail}</StyledFieldValue>
            </StyledField>
          )}
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
      </StyledBody>
    </StyledContainer>
  );
};
