/**
 * SprintRetro - Core Interface
 * Mural-style sprint retrospective board with sticky notes, columns, and sharing
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SprintRetroPreset = 'board' | 'compact';

export type NoteColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange' | 'purple' | 'white';

export interface RetroNote {
  id: string;
  content: string;
  author?: string;
  color?: NoteColor;
  votes?: number;
  voted?: boolean;
  position?: { x: number; y: number };
}

export interface RetroColumn {
  id: string;
  title: string;
  subtitle?: string;
  notes: RetroNote[];
  color?: string;
  icon?: ReactNode;
}

export interface RetroParticipant {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
  role?: 'facilitator' | 'participant';
}

export interface SprintRetroProps extends EngineAwareProps {
  preset?: SprintRetroPreset;
  title?: string;
  teamName?: string;
  columns: RetroColumn[];
  participants?: RetroParticipant[];
  onAddNote?: (columnId: string, note: Partial<RetroNote>) => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onVoteNote?: (noteId: string) => void;
  onMoveNote?: (noteId: string, targetColumnId: string) => void;
  onShare?: () => void;
  shareConfig?: {
    hasPassword?: boolean;
    expirationOptions?: Array<{ value: string; label: string }>;
    memberCount?: number;
    visitorCount?: number;
  };
  toolbar?: Array<{
    key: string;
    icon?: ReactNode;
    label?: string;
    active?: boolean;
    onClick?: () => void;
  }>;
  zoomLevel?: number;
  onZoomChange?: (level: number) => void;
  editable?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SPRINT_RETRO_DEFAULTS: Partial<SprintRetroProps> = {
  preset: 'board',
  title: 'Sprint retrospective',
  zoomLevel: 100,
  editable: true,
};

// ============================================================================
// Shared Utilities
// ============================================================================

export function getNoteColors(tokens: DesignTokens): Record<NoteColor, { bg: string; text: string; border: string; accent: string }> {
  return {
    yellow: { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[800], border: tokens.colors.warningScale[400], accent: tokens.colors.warningScale[400] },
    green:  { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[800], border: tokens.colors.successScale[400], accent: tokens.colors.successScale[400] },
    pink:   { bg: tokens.colors.errorScale[100],   text: tokens.colors.errorScale[800],   border: tokens.colors.errorScale[400],   accent: tokens.colors.errorScale[400] },
    blue:   { bg: tokens.colors.infoScale[100],    text: tokens.colors.infoScale[800],    border: tokens.colors.infoScale[400],    accent: tokens.colors.infoScale[400] },
    orange: { bg: tokens.colors.warningScale[200], text: tokens.colors.warningScale[800], border: tokens.colors.warningScale[500], accent: tokens.colors.warningScale[500] },
    purple: { bg: tokens.colors.secondaryScale[100], text: tokens.colors.secondaryScale[800], border: tokens.colors.secondaryScale[400], accent: tokens.colors.secondaryScale[400] },
    white:  { bg: tokens.colors.common.white,      text: tokens.colors.neutral[700],      border: tokens.colors.neutral[200],      accent: tokens.colors.neutral[400] },
  };
}
