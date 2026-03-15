/**
 * BhUnifiedInbox - All Presets
 */

export { OmnichannelBhUnifiedInbox } from './omnichannel';
export { ThreadBhUnifiedInbox } from './thread';
export { SequencesBhUnifiedInbox } from './sequences';

import type { BhUnifiedInboxPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhUnifiedInboxProps } from '../core';
import { OmnichannelBhUnifiedInbox } from './omnichannel';
import { ThreadBhUnifiedInbox } from './thread';
import { SequencesBhUnifiedInbox } from './sequences';

export const BH_UNIFIED_INBOX_PRESETS: Record<BhUnifiedInboxPreset, ComponentType<BhUnifiedInboxProps>> = {
  omnichannel: OmnichannelBhUnifiedInbox,
  thread: ThreadBhUnifiedInbox,
  sequences: SequencesBhUnifiedInbox,
};
