/**
 * BhReferenceReport - Main Export
 * Reference checking report for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhReferenceReportProps } from './core';
import { BH_REFERENCE_REPORT_DEFAULTS } from './core';
import { BH_REFERENCE_REPORT_PRESETS } from './presets';

export {
  type BhReferenceReportProps,
  type BhReferenceReportPreset,
  type ReferenceCheck,
  type ReferenceResponse,
  type ReferenceDimension,
  type ReferenceReport,
  BH_REFERENCE_REPORT_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhReferenceReport component
 * Renders the appropriate preset based on the preset prop
 */
export function BhReferenceReport(props: BhReferenceReportProps): React.ReactElement {
  const preset = props.preset ?? BH_REFERENCE_REPORT_DEFAULTS.preset ?? 'summary';
  const PresetComponent = BH_REFERENCE_REPORT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhReferenceReport.displayName = 'BhReferenceReport';

export { SummaryBhReferenceReport, DetailBhReferenceReport } from './presets';
