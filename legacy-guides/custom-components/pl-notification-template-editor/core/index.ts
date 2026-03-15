/**
 * PlNotificationTemplateEditor - Core Interface
 * Design notification templates with variables, conditions, and multi-channel preview
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlNotificationTemplateEditorPreset = 'editor' | 'preview';

export interface NotificationTemplateEditorItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlNotificationTemplateEditorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlNotificationTemplateEditorPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NotificationTemplateEditorItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback when an item is created */
  onCreate?: () => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_NOTIFICATION_TEMPLATE_EDITOR_DEFAULTS: Partial<PlNotificationTemplateEditorProps> = {
  preset: 'editor',
};
