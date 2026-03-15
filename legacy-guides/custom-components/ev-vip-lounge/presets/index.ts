export { VipLoungeHost } from './host';
export { VipLoungeConcierge } from './concierge';

import type { VipLoungePreset } from '../core';
import type { ComponentType } from 'react';
import type { VipLoungeProps } from '../core';
import { VipLoungeHost } from './host';
import { VipLoungeConcierge } from './concierge';

export const PRESETS: Record<VipLoungePreset, ComponentType<VipLoungeProps>> =
  {
    host: VipLoungeHost,
    concierge: VipLoungeConcierge,
  };
