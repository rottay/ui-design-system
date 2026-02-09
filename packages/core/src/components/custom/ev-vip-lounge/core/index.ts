import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type VipLoungePreset = 'host' | 'concierge';

export interface VipGuest {
  id: string;
  name: string;
  tier: string;
  status: 'expected' | 'arrived' | 'seated' | 'departed';
  tableLabel?: string;
  host?: string;
  bottleService?: boolean;
  arrival?: Date;
}

export interface ConciergeRequest {
  id: string;
  guestId: string;
  guestName: string;
  type: 'limo' | 'meet-artist' | 'photographer' | 'custom';
  description: string;
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
}

export interface VipLoungeProps extends EngineAwareProps {
  preset?: VipLoungePreset;
  guests?: VipGuest[];
  requests?: ConciergeRequest[];
  onGuestStatusChange?: (guestId: string, status: VipGuest['status']) => void;
  onRequestAction?: (requestId: string, action: 'start' | 'complete') => void;
  style?: CSSProperties;
  className?: string;
}

export const VIP_LOUNGE_DEFAULTS: Required<
  Pick<VipLoungeProps, 'preset' | 'guests' | 'requests'>
> = {
  preset: 'host',
  guests: [],
  requests: [],
};
