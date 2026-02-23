/**
 * BhQuestionBank - Main Export
 * Dashboard widget showing question bank statistics at a glance.
 */

import type { BhQuestionBankProps } from './core';
import { BH_QUESTION_BANK_DEFAULTS } from './core';
import { BH_QUESTION_BANK_PRESETS } from './presets';

export {
  type BhQuestionBankProps,
  type BhQuestionBankPreset,
  type QuestionBankStats,
  type QuestionPreview,
  BH_QUESTION_BANK_DEFAULTS,
} from './core';
export * from './presets';

export function BhQuestionBank(props: BhQuestionBankProps): React.ReactElement {
  const preset = props.preset ?? BH_QUESTION_BANK_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_QUESTION_BANK_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhQuestionBank.displayName = 'BhQuestionBank';

export { CompactBhQuestionBank } from './presets';
