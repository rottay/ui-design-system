/**
 * EmailSequence - Main Export
 * Automatically selects preset based on props
 */

import type { EmailSequenceProps } from './core';
import { EMAIL_SEQUENCE_DEFAULTS } from './core';
import { EMAIL_SEQUENCE_PRESETS } from './presets';

export {
  type EmailSequenceProps,
  type EmailSequencePreset,
  type SequenceStatus,
  type ToolbarAction,
  type DelayUnit,
  type StepDelay,
  type StepStatus,
  type EmailRecipientField,
  type EmailStep,
  type ContactSendStatus,
  type SequenceContact,
  EMAIL_SEQUENCE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EmailSequence component
 * Renders the appropriate preset based on the preset prop
 */
export function EmailSequence(props: EmailSequenceProps): React.ReactElement {
  const preset = props.preset ?? EMAIL_SEQUENCE_DEFAULTS.preset ?? 'builder';
  const PresetComponent = EMAIL_SEQUENCE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EmailSequence.displayName = 'EmailSequence';

export { BuilderEmailSequence, PreviewEmailSequence } from './presets';
