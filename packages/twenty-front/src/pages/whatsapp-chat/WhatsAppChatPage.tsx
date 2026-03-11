import { IconMessage } from 'twenty-ui/display';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { WhatsAppChatContainer } from '@/whatsapp-chat/components/WhatsAppChatContainer';

export const WhatsAppChatPage = () => {
  return (
    <PageContainer>
      <PageHeader title="WhatsApp Chat" Icon={IconMessage} />
      <PageBody>
        <WhatsAppChatContainer />
      </PageBody>
    </PageContainer>
  );
};
