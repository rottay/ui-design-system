import type { EngineAwareProps } from '../../../../types';

export type AnnouncementBannerPreset = 'standard' | 'gradient';

export interface AnnouncementBannerProps extends EngineAwareProps {
  preset?: AnnouncementBannerPreset;
  message: string;
  link?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ANNOUNCEMENT_BANNER_DEFAULTS = {
  preset: 'standard' as AnnouncementBannerPreset,
  dismissible: true,
};
