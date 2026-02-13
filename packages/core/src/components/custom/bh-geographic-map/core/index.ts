/**
 * BhGeographicMap - Core Interface
 * Candidate geographic distribution visualization for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhGeographicMapPreset = 'map' | 'compact';

export interface GeoRegion {
  id: string;
  name: string;
  candidateCount: number;
  latitude: number;
  longitude: number;
}

export interface BhGeographicMapProps extends EngineAwareProps {
  preset?: BhGeographicMapPreset;

  /** Regions with candidate counts */
  regions: GeoRegion[];

  /** Dashboard title */
  title?: string;

  /** Callback when a region is clicked */
  onRegionClick?: (regionId: string) => void;

  /** Currently selected region ID */
  selectedRegionId?: string | null;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_GEOGRAPHIC_MAP_DEFAULTS: Partial<BhGeographicMapProps> = {
  preset: 'map',
  title: 'Geographic Distribution',
};
