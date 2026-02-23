/**
 * BhUnifiedInbox - Main Export
 * Unified Inbox for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhUnifiedInboxProps } from './core';
import { BH_UNIFIED_INBOX_DEFAULTS } from './core';
import { BH_UNIFIED_INBOX_PRESETS } from './presets';

export {
  type BhUnifiedInboxProps,
  type BhUnifiedInboxPreset,
  type InboxChannel,
  type InboxThread,
  type InboxMessage,
  type InboxAttachment,
  type InboxSequence,
  type SequenceStep,
  type InboxStats,
  BH_UNIFIED_INBOX_DEFAULTS,
  getChannelIcon,
  getChannelColor,
  formatTimeAgo,
  getSequenceStatusColor,
} from './core';
export * from './presets';

/**
 * BhUnifiedInbox component
 * Renders the appropriate preset based on the preset prop
 */
export function BhUnifiedInbox(props: BhUnifiedInboxProps): React.ReactElement {
  const preset = props.preset ?? BH_UNIFIED_INBOX_DEFAULTS.preset ?? 'omnichannel';
  const PresetComponent = BH_UNIFIED_INBOX_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhUnifiedInbox.displayName = 'BhUnifiedInbox';

export { OmnichannelBhUnifiedInbox, ThreadBhUnifiedInbox, SequencesBhUnifiedInbox } from './presets';
