/**
 * BhQuestionBank - All Presets
 */

import type { BhQuestionBankPreset, BhQuestionBankProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhQuestionBank } from './compact';

export { CompactBhQuestionBank } from './compact';

export const BH_QUESTION_BANK_PRESETS: Record<BhQuestionBankPreset, ComponentType<BhQuestionBankProps>> = {
  compact: CompactBhQuestionBank,
};
