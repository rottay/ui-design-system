/**
 * ChatMessaging - All Presets
 */

import type { ChatMessagingPreset, ChatMessagingProps } from '../core';
import type { ComponentType } from 'react';
import { SplitChatMessaging } from './split';
import { PanelChatMessaging } from './panel';

export { SplitChatMessaging } from './split';
export { PanelChatMessaging } from './panel';

export const CHAT_MESSAGING_PRESETS: Record<ChatMessagingPreset, ComponentType<ChatMessagingProps>> = {
  split: SplitChatMessaging,
  panel: PanelChatMessaging,
};
