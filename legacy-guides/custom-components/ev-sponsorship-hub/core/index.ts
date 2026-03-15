/**
 * EvSponsorshipHub - Core Interface
 * Sponsor CRM with pipeline kanban and dashboard for deliverables and ROI tracking
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvSponsorshipHubPreset = 'pipeline' | 'dashboard';

export interface Sponsor {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  dealValue: number;
  status: 'lead' | 'proposal' | 'negotiating' | 'confirmed' | 'active' | 'completed';
  deliverables: SponsorDeliverable[];
  roi?: number;
  logoUrl?: string;
}

export interface SponsorDeliverable {
  id: string;
  name: string;
  type: 'logo-placement' | 'booth' | 'stage-naming' | 'digital-ad' | 'product-sampling';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: Date;
}

export interface EvSponsorshipHubProps extends EngineAwareProps {
  preset?: EvSponsorshipHubPreset;
  sponsors?: Sponsor[];
  onSponsorClick?: (sponsorId: string) => void;
  onStatusChange?: (sponsorId: string, status: Sponsor['status']) => void;
  onCreateSponsor?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SPONSORSHIP_HUB_DEFAULTS: Partial<EvSponsorshipHubProps> = {
  preset: 'pipeline',
};
