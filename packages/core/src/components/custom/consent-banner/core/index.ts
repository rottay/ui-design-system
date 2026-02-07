import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type ConsentBannerPreset = 'bar' | 'modal';

export interface ConsentCategory {
  key: string;
  name: string;
  description: string;
  required?: boolean;
  defaultEnabled?: boolean;
}

export interface ConsentBannerProps extends EngineAwareProps {
  preset?: ConsentBannerPreset;
  categories?: ConsentCategory[];
  onAccept?: (consents: Record<string, boolean>) => void;
  onReject?: () => void;
  position?: 'top' | 'bottom';
  privacyPolicyLabel?: string;
  cookiePolicyLabel?: string;
  title?: string;
  description?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  preferencesLabel?: string;
  icon?: ReactNode;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export const DEFAULT_CATEGORIES: ConsentCategory[] = [
  { key: 'necessary', name: 'Necessary', description: 'Required for the website to function properly.', required: true, defaultEnabled: true },
  { key: 'analytics', name: 'Analytics', description: 'Help us understand how visitors interact with our website.', defaultEnabled: false },
  { key: 'marketing', name: 'Marketing', description: 'Used to deliver personalized advertisements.', defaultEnabled: false },
];

export const CONSENT_BANNER_DEFAULTS: Partial<ConsentBannerProps> = {
  preset: 'bar',
  position: 'bottom',
  title: 'Cookie Preferences',
  description: 'We use cookies to enhance your experience.',
  acceptLabel: 'Accept All',
  rejectLabel: 'Reject All',
  preferencesLabel: 'Preferences',
  visible: true,
};
