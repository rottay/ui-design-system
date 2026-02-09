/**
 * EvScreenController - Core Interface
 * Screen/display content controller
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvScreenControllerPreset = 'editor' | 'preview';

export interface ScreenContent {
  id: string;
  type: "announcement" | "sponsor" | "schedule" | "social" | "custom";
  title: string;
  content: string;
  imageUrl?: string;
  duration: number;
  order: number;
  isActive: boolean;
}

export interface ScreenSchedule {
  id: string;
  startTime: Date;
  endTime: Date;
  contentIds: string[];
}

export interface EvScreenControllerProps extends EngineAwareProps {
  preset?: EvScreenControllerPreset;
  contentItems?: ScreenContent[];
  schedule?: ScreenSchedule[];
  onAddContent?: () => void;
  onEditContent?: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  onToggleActive?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_SCREEN_CONTROLLER_DEFAULTS: Partial<EvScreenControllerProps> = {
  preset: 'editor',

};
