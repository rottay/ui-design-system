import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type MobileNavPreset = 'drawer' | 'bottom-sheet';

export interface MobileNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children?: MobileNavItem[];
}

export interface MobileNavProps extends EngineAwareProps {
  preset?: MobileNavPreset;
  items: MobileNavItem[];
  activeKey?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  logo?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MOBILE_NAV_DEFAULTS = {
  preset: 'drawer' as MobileNavPreset,
};
