/**
 * ChatMessaging - All Presets
 */

import type { ChatMessagingPreset } from '../core';
import { SplitChatMessaging } from './split';
import { PanelChatMessaging } from './panel';

export { SplitChatMessaging } from './split';
export { PanelChatMessaging } from './panel';

export const CHAT_MESSAGING_PRESETS: Record<ChatMessagingPreset, React.ComponentType<any>> = {
  split: SplitChatMessaging,
  panel: PanelChatMessaging,
};
