import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type LogoCloudPreset = 'grid' | 'scrolling' | 'tiered';

export interface LogoItem {
  key: string;
  name: string;
  logo: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface LogoCloudProps extends EngineAwareProps {
  preset?: LogoCloudPreset;
  logos: LogoItem[];
  title?: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LOGO_CLOUD_DEFAULTS = {
  preset: 'grid' as LogoCloudPreset,
};
