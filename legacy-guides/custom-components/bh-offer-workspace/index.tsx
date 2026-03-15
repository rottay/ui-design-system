/**
 * BhOfferWorkspace - Main Export
 * Offer Management workspace for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhOfferWorkspaceProps } from './core';
import { BH_OFFER_WORKSPACE_DEFAULTS } from './core';
import { BH_OFFER_WORKSPACE_PRESETS } from './presets';

export {
  type BhOfferWorkspaceProps,
  type BhOfferWorkspacePreset,
  type OfferStatus,
  type DBOffer,
  type RecruiterOffer,
  type BenefitCategory,
  type BenefitItem,
  type ApprovalStep,
  type NegotiationVersion,
  type NegotiationChange,
  type DocumentInfo,
  type SignatureStatus,
  type CompensationData,
  type EmploymentTerms,
  type RelocationPackage,
  BH_OFFER_WORKSPACE_DEFAULTS,
  getOfferStatusConfig,
  getOfferPipelineSteps,
  getOfferCompensation,
  formatCurrency,
} from './core';
export * from './presets';

/**
 * BhOfferWorkspace component
 * Renders the appropriate preset based on the preset prop
 */
export function BhOfferWorkspace(props: BhOfferWorkspaceProps): React.ReactElement {
  const preset = props.preset ?? BH_OFFER_WORKSPACE_DEFAULTS.preset ?? 'editor';
  const PresetComponent = BH_OFFER_WORKSPACE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhOfferWorkspace.displayName = 'BhOfferWorkspace';

export { EditorBhOfferWorkspace, TrackerBhOfferWorkspace } from './presets';
