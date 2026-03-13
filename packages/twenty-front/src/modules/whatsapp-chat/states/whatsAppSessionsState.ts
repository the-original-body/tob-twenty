import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

import { type WaSession } from '@/whatsapp-chat/types/WhatsAppTypes';

export const whatsAppSessionsState = createStateV2<WaSession[]>({
  key: 'whatsAppSessionsState',
  defaultValue: [],
});
