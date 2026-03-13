import styled from '@emotion/styled';

import { type WaSession } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledContainer = styled.div`
  align-items: center;
  background: #EEF0F3;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
`;

const StyledTitle = styled.h1`
  color: #111827;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
`;

const StyledSubtitle = styled.p`
  color: #6B7280;
  font-size: 15px;
  margin: 0 0 32px;
`;

const StyledGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  max-width: 900px;
  width: 100%;
`;

const StyledCard = styled.button`
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  display: flex;
  gap: 16px;
  padding: 20px;
  text-align: left;
  transition: all 150ms ease;

  &:hover {
    border-color: #1A6CFF;
    box-shadow: 0 4px 12px rgba(26, 108, 255, 0.12);
    transform: translateY(-1px);
  }
`;

const StyledAvatar = styled.div`
  align-items: center;
  background: #1A6CFF;
  border-radius: 50%;
  color: #FFFFFF;
  display: flex;
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 600;
  height: 48px;
  justify-content: center;
  width: 48px;
`;

const StyledCardInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const StyledCardName = styled.span`
  color: #111827;
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCardMeta = styled.span`
  color: #9CA3AF;
  font-size: 13px;
`;

const StyledStatusDot = styled.span<{ isOnline: boolean }>`
  background: ${({ isOnline }) => (isOnline ? '#22C55E' : '#D1D5DB')};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-right: 6px;
  width: 8px;
`;

const StyledLoadingState = styled.div`
  color: #9CA3AF;
  font-size: 15px;
`;

const StyledErrorState = styled.div`
  color: #DC2626;
  font-size: 15px;
`;

type SessionPickerProps = {
  sessions: WaSession[];
  loading: boolean;
  error: string | null;
  onSelectSession: (session: WaSession) => void;
};

export const SessionPicker = ({
  sessions,
  loading,
  error,
  onSelectSession,
}: SessionPickerProps) => {
  const getInitials = (session: WaSession): string => {
    const name = session.me?.pushName || session.name;
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <StyledContainer>
      <StyledTitle>WhatsApp Sessions</StyledTitle>
      <StyledSubtitle>Select a session to view conversations</StyledSubtitle>

      {loading && <StyledLoadingState>Loading sessions...</StyledLoadingState>}

      {error && <StyledErrorState>{error}</StyledErrorState>}

      {!loading && !error && sessions.length === 0 && (
        <StyledLoadingState>No active sessions found</StyledLoadingState>
      )}

      {!loading && !error && sessions.length > 0 && (
        <StyledGrid>
          {sessions.map((session) => (
            <StyledCard
              key={session.name}
              onClick={() => onSelectSession(session)}
            >
              <StyledAvatar>{getInitials(session)}</StyledAvatar>
              <StyledCardInfo>
                <StyledCardName>
                  {session.me?.pushName || session.name}
                </StyledCardName>
                <StyledCardMeta>
                  <StyledStatusDot
                    isOnline={session.status === 'WORKING'}
                  />
                  {session.status === 'WORKING' ? 'Connected' : session.status}
                  {session.me?.pushName && session.me.pushName !== session.name
                    ? ` · ${session.name}`
                    : ''}
                </StyledCardMeta>
              </StyledCardInfo>
            </StyledCard>
          ))}
        </StyledGrid>
      )}
    </StyledContainer>
  );
};
