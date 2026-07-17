import type { IconRole, IconState, IconTone } from '../..';
import type { IconName } from '..';

export type AdapterIconWeight = 'regular' | 'bold' | 'fill' | 'duotone';

const ROLE_WEIGHT: Readonly<Record<IconRole, AdapterIconWeight>> = {
  control: 'regular',
  navigation: 'regular',
  feature: 'duotone',
  status: 'duotone',
  illustration: 'duotone',
};

const STATE_WEIGHT: Readonly<Partial<Record<IconState, AdapterIconWeight>>> = {
  active: 'fill',
  busy: 'bold',
  success: 'fill',
  error: 'fill',
};

const STATUS_TONES: Readonly<Partial<Record<IconName, IconTone>>> = {
  'status.success': 'success',
  'status.warning': 'warning',
  'status.error': 'error',
  'status.info': 'info',
  'status.secure': 'success',
};

export function resolveIconWeight(role: IconRole, state: IconState): AdapterIconWeight {
  return STATE_WEIGHT[state] ?? ROLE_WEIGHT[role];
}

export function resolveIconTone(
  name: IconName,
  state: IconState,
  requestedTone: IconTone | undefined,
): IconTone {
  if (requestedTone) return requestedTone;
  if (state === 'success') return 'success';
  if (state === 'error') return 'error';
  return STATUS_TONES[name] ?? 'default';
}
