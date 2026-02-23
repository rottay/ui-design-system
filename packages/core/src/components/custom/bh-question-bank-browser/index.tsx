/**
 * BhQuestionBankBrowser - Main Export
 * Full-page question bank library and detail views for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhQuestionBankBrowserProps } from './core';
import { BH_QUESTION_BANK_BROWSER_DEFAULTS } from './core';
import { BH_QUESTION_BANK_BROWSER_PRESETS } from './presets';

export {
  type BhQuestionBankBrowserProps,
  type BhQuestionBankBrowserPreset,
  type Question,
  type QuestionBankData,
  BH_QUESTION_BANK_BROWSER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhQuestionBankBrowser component
 * Renders the appropriate preset based on the preset prop
 */
export function BhQuestionBankBrowser(props: BhQuestionBankBrowserProps): React.ReactElement {
  const preset = props.preset ?? BH_QUESTION_BANK_BROWSER_DEFAULTS.preset ?? 'library';
  const PresetComponent = BH_QUESTION_BANK_BROWSER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhQuestionBankBrowser.displayName = 'BhQuestionBankBrowser';

export { LibraryBhQuestionBankBrowser, DetailBhQuestionBankBrowser } from './presets';
