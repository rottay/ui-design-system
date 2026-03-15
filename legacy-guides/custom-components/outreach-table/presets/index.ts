/**
 * OutreachTable Presets
 */

export { StandardOutreachTable } from './standard';
export { PipelineOutreachTable } from './pipeline';

import type { OutreachTablePreset } from '../core';
import type { ComponentType } from 'react';
import type { OutreachTableProps } from '../core';
import { StandardOutreachTable } from './standard';
import { PipelineOutreachTable } from './pipeline';

export const OUTREACH_TABLE_PRESETS: Record<OutreachTablePreset, ComponentType<OutreachTableProps>> = {
  standard: StandardOutreachTable as ComponentType<OutreachTableProps>,
  pipeline: PipelineOutreachTable as ComponentType<OutreachTableProps>,
};
