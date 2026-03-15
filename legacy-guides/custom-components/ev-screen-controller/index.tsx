/**
 * EvScreenController - Main Export
 * Screen/display content controller
 * Automatically selects preset based on props
 */

import type { EvScreenControllerProps } from './core';
import { EV_SCREEN_CONTROLLER_DEFAULTS } from './core';
import { EV_SCREEN_CONTROLLER_PRESETS } from './presets';

export {
  type EvScreenControllerProps,
  type EvScreenControllerPreset,
  type ScreenContent as EvScreenControllerScreenContent,
  type ScreenSchedule as EvScreenControllerScreenSchedule,
  EV_SCREEN_CONTROLLER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvScreenController component
 * Renders the appropriate preset based on the preset prop
 */
export function EvScreenController(props: EvScreenControllerProps): React.ReactElement {
  const preset = props.preset ?? EV_SCREEN_CONTROLLER_DEFAULTS.preset ?? 'editor';
  const PresetComponent = EV_SCREEN_CONTROLLER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvScreenController.displayName = 'EvScreenController';

export { EditorEvScreenController, PreviewEvScreenController } from './presets';
