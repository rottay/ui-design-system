/**
 * EvSeasonPassManager - Core Interface
 * Season pass management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvSeasonPassManagerPreset = 'overview' | 'editor';

export interface SeasonPassType {
  id: string;
  name: string;
  description: string;
  price: number;
  validFrom: Date;
  validUntil: Date;
  includedEvents: number;
  maxUses: number;
  holdersCount: number;
  status: "active" | "expired" | "draft";
}

export interface PassHolder {
  id: string;
  holderName: string;
  email: string;
  passType: string;
  usageCount: number;
  maxUses: number;
  validUntil: Date;
}

export interface EvSeasonPassManagerProps extends EngineAwareProps {
  preset?: EvSeasonPassManagerPreset;
  passTypes?: SeasonPassType[];
  holders?: PassHolder[];
  onPassTypeClick?: (id: string) => void;
  onHolderClick?: (id: string) => void;
  onCreatePass?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SEASON_PASS_MANAGER_DEFAULTS: Partial<EvSeasonPassManagerProps> = {
  preset: 'overview',

};
