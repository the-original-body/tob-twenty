import styled from '@emotion/styled';
import { IconMessage } from 'twenty-ui/display';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { WhatsAppChatContainer } from '@/whatsapp-chat/components/WhatsAppChatContainer';

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledPanel = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export const WhatsAppChatPage = () => {
  return (
    <StyledPage>
      <PageHeader title="WhatsApp Chat" Icon={IconMessage} />
      <StyledBody>
        <StyledPanel>
          <WhatsAppChatContainer />
        </StyledPanel>
      </StyledBody>
    </StyledPage>
  );
};
