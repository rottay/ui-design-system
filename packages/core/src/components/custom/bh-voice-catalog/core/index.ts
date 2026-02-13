/**
 * BhVoiceCatalog - Core Interface
 * Voice grid with preview, filters, language tags
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhVoiceCatalogPreset = 'grid' | 'compact';

export interface VoiceProfile {
  id: string;
  name: string;
  provider: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  style: string;
  sampleUrl?: string;
  isDefault?: boolean;
}

export interface BhVoiceCatalogProps extends EngineAwareProps {
  preset?: BhVoiceCatalogPreset;
  voices: VoiceProfile[];
  selectedVoiceId?: string | null;
  filterLanguage?: string | null;
  filterGender?: string | null;
  onVoiceSelect?: (voiceId: string) => void;
  onPreview?: (voiceId: string) => void;
  onFilterChange?: (filter: { language?: string | null; gender?: string | null }) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_VOICE_CATALOG_DEFAULTS: Partial<BhVoiceCatalogProps> = {
  preset: 'grid',
};
