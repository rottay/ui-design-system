/**
 * BhSprintRetrospective - Core Interface
 * Sprint retrospective form for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhSprintRetrospectivePreset = 'form' | 'compact';

export interface RetroItem {
  id: string;
  text: string;
  category: 'good' | 'improve' | 'action';
  votes: number;
  author: string;
}

export interface BhSprintRetrospectiveProps extends EngineAwareProps {
  preset?: BhSprintRetrospectivePreset;

  /** Retrospective items */
  items: RetroItem[];

  /** Sprint name */
  sprintName?: string;

  /** Callback to add a new item */
  onAddItem?: (category: string, text: string) => void;

  /** Callback to vote on an item */
  onVote?: (itemId: string) => void;

  /** Callback to delete an item */
  onDeleteItem?: (itemId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_SPRINT_RETROSPECTIVE_DEFAULTS: Partial<BhSprintRetrospectiveProps> = {
  preset: 'form',
};
