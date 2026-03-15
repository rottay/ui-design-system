/**
 * EvRadioChannel - Main Export
 * Digital walkie-talkie with multi-channel communication and quick responses
 */

import type { EvRadioChannelProps } from './core';
import { EV_RADIO_CHANNEL_DEFAULTS } from './core';
import { EV_RADIO_CHANNEL_PRESETS } from './presets';

export {
  type EvRadioChannelProps,
  type EvRadioChannelPreset,
  type RadioChannel as EvRadioChannelRadioChannel,
  type RadioMessage as EvRadioChannelRadioMessage,
  EV_RADIO_CHANNEL_DEFAULTS,
} from './core';
export * from './presets';

export function EvRadioChannel(props: EvRadioChannelProps): React.ReactElement {
  const preset = props.preset ?? EV_RADIO_CHANNEL_DEFAULTS.preset ?? 'dispatcher';
  const PresetComponent = EV_RADIO_CHANNEL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

EvRadioChannel.displayName = 'EvRadioChannel';

export { DispatcherEvRadioChannel, PersonalEvRadioChannel } from './presets';
