/**
 * EmailSequence - All Presets
 */

import type { EmailSequencePreset, EmailSequenceProps } from '../core';
import type { ComponentType } from 'react';
import { BuilderEmailSequence } from './builder';
import { PreviewEmailSequence } from './preview';

export { BuilderEmailSequence } from './builder';
export { PreviewEmailSequence } from './preview';

export const EMAIL_SEQUENCE_PRESETS: Record<EmailSequencePreset, ComponentType<EmailSequenceProps>> = {
  builder: BuilderEmailSequence,
  preview: PreviewEmailSequence,
};
