import type { ExpressiveIconProfile } from '@/foundation/tokens/ts/presentation/expressive-profiles';

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

/**
 * Expressive icon postures (C1b substrate). Every Phosphor glyph module
 * already bundles all weights, so a posture is pure table selection — no
 * pack regeneration. The axis itself is FRONTIER: no tenant schema accepts
 * it yet and no provider stamps a profile, but the resolver is proven
 * profile-ready so opening the axis later is wiring, not pipeline work.
 * State weights stay supreme in every posture: feedback is never traded
 * for decoration.
 */
const PROFILE_ROLE_WEIGHT: Readonly<
  Record<ExpressiveIconProfile, Readonly<Record<IconRole, AdapterIconWeight>>>
> = {
  linear: {
    control: 'regular',
    navigation: 'regular',
    feature: 'regular',
    status: 'regular',
    illustration: 'regular',
  },
  'strong-outline': {
    control: 'bold',
    navigation: 'bold',
    feature: 'bold',
    status: 'bold',
    illustration: 'bold',
  },
  duotone: {
    control: 'regular',
    navigation: 'duotone',
    feature: 'duotone',
    status: 'duotone',
    illustration: 'duotone',
  },
  'solid-active': {
    control: 'regular',
    navigation: 'regular',
    feature: 'fill',
    status: 'fill',
    illustration: 'duotone',
  },
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

export function resolveIconWeight(
  role: IconRole,
  state: IconState,
  profile?: ExpressiveIconProfile
): AdapterIconWeight {
  return (
    STATE_WEIGHT[state] ?? (profile ? PROFILE_ROLE_WEIGHT[profile] : ROLE_WEIGHT)[role]
  );
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
