import type { RunsheetProps } from './core';
import { RUNSHEET_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type {
  RunsheetProps,
  RunsheetCue,
  RunsheetPreset,
} from './core';

export type EvRunsheetProps = RunsheetProps;

export function Runsheet(props: RunsheetProps) {
  const { preset = RUNSHEET_DEFAULTS.preset, ...rest } = props;
  const Component = PRESETS[preset];
  return <Component {...rest} />;
}

Runsheet.displayName = 'Runsheet';

export const EvRunsheet = Runsheet;
export { ProducerEvRunsheet, DisplayEvRunsheet } from './presets';
