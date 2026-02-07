/**
 * ChatMessaging - Main Export
 * Automatically selects preset based on props
 */

import type { ChatMessagingProps } from './core';
import { CHAT_MESSAGING_DEFAULTS } from './core';
import { CHAT_MESSAGING_PRESETS } from './presets';

export { type ChatMessagingProps, type ChatMessagingPreset, type ChatMessage, type Conversation, type ConversationParticipant, type ConversationTab, type EmbeddedCard, type EmbeddedCardType, type MessageAttachment, type MessageStatus, CHAT_MESSAGING_DEFAULTS } from './core';
export * from './presets';

/**
 * ChatMessaging component
 * Renders the appropriate preset based on the preset prop
 */
export function ChatMessaging(props: ChatMessagingProps): React.ReactElement {
  const preset = props.preset ?? CHAT_MESSAGING_DEFAULTS.preset ?? 'split';
  const PresetComponent = CHAT_MESSAGING_PRESETS[preset];

  return <PresetComponent {...props} />;
}

ChatMessaging.displayName = 'ChatMessaging';

export { SplitChatMessaging, PanelChatMessaging } from './presets';
