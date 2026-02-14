/**
 * BhVoiceCatalog - Core Interface
 * Voice grid with preview, filters, language tags
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBModel fields: id, providerId, externalId, name, displayName, type, status, gender, age, language, accent, etc.
 * DBModel.gender enum: 'male' | 'female' | 'neutral' | 'unknown'
 * DBModel.type enum: 'tts_voice' | 'stt_model' | 'chat_model' | 'embedding_model' | 'agent_template'
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBModel } from '@rottay/ia-chat';

export type BhVoiceCatalogPreset = 'grid' | 'compact';

/**
 * Voice profile display - projection of DBModel (type = 'tts_voice').
 */
export interface VoiceProfile {
  /** DBModel.id */
  id: string;
  /** DBModel.displayName or DBModel.name */
  name: string;
  /** Joined from DBProvider.code via DBModel.providerId */
  provider: string;
  /** DBModel.language */
  language: string;
  /** DBModel.gender (DB enum: 'male'|'female'|'neutral'|'unknown') */
  gender: 'male' | 'female' | 'neutral';
  /** DBModel.accent or derived style */
  style: string;
  sampleUrl?: string;
  /** DBModel.isDefault */
  isDefault?: boolean;
}

export interface BhVoiceCatalogProps extends EngineAwareProps {
  preset?: BhVoiceCatalogPreset;
  voices?: VoiceProfile[];
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
