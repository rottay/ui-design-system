/**
 * FooterSection Presets
 */

import type { FooterSectionPreset, FooterSectionProps } from '../core';
import type { ComponentType } from 'react';
import { MultiColumnFooterSection } from './multi-column';
import { SimpleFooterSection } from './simple';
import { CenteredFooterSection } from './centered';

export const PRESETS: Record<FooterSectionPreset, ComponentType<FooterSectionProps>> = {
  'multi-column': MultiColumnFooterSection,
  simple: SimpleFooterSection,
  centered: CenteredFooterSection,
};
