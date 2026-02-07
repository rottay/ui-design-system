import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type MegaMenuPreset = 'standard' | 'tabbed';

export interface MegaMenuGroup {
  key: string;
  title: string;
  items: Array<{
    key: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
  }>;
  featured?: boolean;
}

export interface MegaMenuProps extends EngineAwareProps {
  preset?: MegaMenuPreset;
  groups: MegaMenuGroup[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MEGA_MENU_DEFAULTS = {
  preset: 'standard' as MegaMenuPreset,
};
