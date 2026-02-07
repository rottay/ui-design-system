/**
 * FooterSection Presets
 */

import type { FooterSectionPreset } from '../core';
import { MultiColumnFooterSection } from './multi-column';
import { SimpleFooterSection } from './simple';
import { CenteredFooterSection } from './centered';

export const PRESETS: Record<FooterSectionPreset, React.ComponentType<any>> = {
  'multi-column': MultiColumnFooterSection,
  simple: SimpleFooterSection,
  centered: CenteredFooterSection,
};
