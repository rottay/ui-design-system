import type { EngineAwareProps } from '../../../../types';

export type ContextualToolbarPreset = 'floating' | 'anchored';

export interface ToolbarAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  divider?: boolean;
  active?: boolean;
}

export interface ContextualToolbarProps extends EngineAwareProps {
  preset?: ContextualToolbarPreset;
  actions: ToolbarAction[];
  visible?: boolean;
  position?: { top: number; left: number };
  className?: string;
  style?: React.CSSProperties;
}

export const CONTEXTUAL_TOOLBAR_DEFAULTS = {
  preset: 'floating' as ContextualToolbarPreset,
  visible: true,
};
