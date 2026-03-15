import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type GuestProfilePreset = 'full' | 'card';

export interface GuestPreference {
  category: 'food' | 'music' | 'seating';
  value: string;
}

export interface GuestProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  eventsAttended: number;
  totalSpend: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  preferences: GuestPreference[];
  tags: string[];
}

export interface GuestProfileProps extends EngineAwareProps {
  preset?: GuestProfilePreset;
  profiles?: GuestProfile[];
  selectedGuestId?: string;
  onGuestClick?: (guestId: string) => void;
  onTagAdd?: (guestId: string, tag: string) => void;
  style?: CSSProperties;
  className?: string;
}

export const GUEST_PROFILE_DEFAULTS: Required<
  Pick<GuestProfileProps, 'preset' | 'profiles'>
> = {
  preset: 'full',
  profiles: [],
};
