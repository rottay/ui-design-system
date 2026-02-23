/**
 * BhReferenceReport - All Presets
 */

export { SummaryBhReferenceReport } from './summary';
export { DetailBhReferenceReport } from './detail';

import type { BhReferenceReportPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhReferenceReportProps } from '../core';
import { SummaryBhReferenceReport } from './summary';
import { DetailBhReferenceReport } from './detail';

export const BH_REFERENCE_REPORT_PRESETS: Record<BhReferenceReportPreset, ComponentType<BhReferenceReportProps>> = {
  summary: SummaryBhReferenceReport,
  detail: DetailBhReferenceReport,
};
