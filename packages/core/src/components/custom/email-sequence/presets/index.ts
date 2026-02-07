/**
 * EmailSequence - All Presets
 */

import type { EmailSequencePreset } from '../core';
import { BuilderEmailSequence } from './builder';
import { PreviewEmailSequence } from './preview';

export { BuilderEmailSequence } from './builder';
export { PreviewEmailSequence } from './preview';

export const EMAIL_SEQUENCE_PRESETS: Record<EmailSequencePreset, React.ComponentType<any>> = {
  builder: BuilderEmailSequence,
  preview: PreviewEmailSequence,
};
