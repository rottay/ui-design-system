/**
 * BhQuestionBankBrowser - All Presets
 */

export { LibraryBhQuestionBankBrowser } from './library';
export { DetailBhQuestionBankBrowser } from './detail';

import type { BhQuestionBankBrowserPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhQuestionBankBrowserProps } from '../core';
import { LibraryBhQuestionBankBrowser } from './library';
import { DetailBhQuestionBankBrowser } from './detail';

export const BH_QUESTION_BANK_BROWSER_PRESETS: Record<BhQuestionBankBrowserPreset, ComponentType<BhQuestionBankBrowserProps>> = {
  library: LibraryBhQuestionBankBrowser,
  detail: DetailBhQuestionBankBrowser,
};
