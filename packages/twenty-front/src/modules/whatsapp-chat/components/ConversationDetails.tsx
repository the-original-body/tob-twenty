import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { IconX } from 'twenty-ui/display';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { type WaConversation } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledContainer = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 280px;
  width: 280px;
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
  const [assignEmail, setAssignEmail] = useState(
    conversation.assignedToEmail ?? '',
  );

  const displayName =
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
          {conversation.leadFullName && (
            <StyledField>
              <StyledFieldLabel>Full Name</StyledFieldLabel>
              <StyledFieldValue>{conversation.leadFullName}</StyledFieldValue>
            </StyledField>
          )}
          <StyledField>
            <StyledFieldLabel>Session</StyledFieldLabel>
            <StyledFieldValue>{conversation.sessionName}</StyledFieldValue>
          </StyledField>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Status</StyledSectionTitle>
          <StyledField>
            <StyledFieldLabel>Client</StyledFieldLabel>
            <StyledFieldValue>
              {conversation.isClient ? 'Yes' : 'No'}
            </StyledFieldValue>
          </StyledField>
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
          {conversation.assignedToName && (
            <StyledField>
              <StyledFieldLabel>Currently assigned to</StyledFieldLabel>
              <StyledFieldValue>
                {conversation.assignedToName}
              </StyledFieldValue>
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
