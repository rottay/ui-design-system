/**
 * EvRadioChannel - All Presets
 */

export { DispatcherEvRadioChannel } from './dispatcher';
export { PersonalEvRadioChannel } from './personal';

import type { EvRadioChannelPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvRadioChannelProps } from '../core';
import { DispatcherEvRadioChannel } from './dispatcher';
import { PersonalEvRadioChannel } from './personal';

export const EV_RADIO_CHANNEL_PRESETS: Record<EvRadioChannelPreset, ComponentType<EvRadioChannelProps>> = {
  dispatcher: DispatcherEvRadioChannel,
  personal: PersonalEvRadioChannel,
};
