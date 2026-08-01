/**
 * Canonical lowering for bounded appearance postures shared by the static
 * BrandTheme compiler and the DB Appearance compiler.
 *
 * A posture may come from an explicitly authored field or an expressive
 * profile, but it must reach the same CSS channels through this one table.
 */
import type { TenantAppearanceGeneral } from '@/foundation/contracts/composition/tenants/themes';
import { TENANT_THEME_RADIUS_SCALE_BOUNDS } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import { MOTION_DIAL_BOUNDS } from '@/foundation/contracts/runtime/motion';
import { clamp } from '@/foundation/kernel/math';
import { withArabicSafeFallback } from '@/foundation/kernel/typography';
import {
  DENSITY_MODE_FACTOR_VARIABLE,
  isDensityPreference,
  resolveDensityModeFactor,
} from '@/foundation/tokens/ts/foundation/base/density';
import { TYPE_PAIRINGS } from '@/foundation/tokens/ts/presentation/typography/pairings';

export interface AppearancePostureFields {
  readonly typePairing?: NonNullable<
    NonNullable<TenantAppearanceGeneral['typography']>['typePairing']
  >;
  readonly buttonStyle?: NonNullable<
    NonNullable<TenantAppearanceGeneral['shape']>['buttonStyle']
  >;
  readonly radiusScale?: number;
  readonly density?: TenantAppearanceGeneral['density'];
  readonly motion?: TenantAppearanceGeneral['motion'];
  readonly elevation?: NonNullable<
    NonNullable<TenantAppearanceGeneral['surfaces']>['elevation']
  >;
}

const BUTTON_STYLE_RADIUS: Readonly<
  Record<NonNullable<AppearancePostureFields['buttonStyle']>, string>
> = {
  sharp: '2px',
  soft: 'var(--ds-radius-md, 8px)',
  pill: '9999px',
};

const ELEVATION_PRESET: Readonly<
  Record<
    NonNullable<AppearancePostureFields['elevation']>,
    Readonly<Record<string, string>>
  >
> = {
  flat: {
    '--ds-elevation-1': 'none',
    '--ds-elevation-2': 'none',
    '--ds-elevation-3': '0 1px 2px rgba(0,0,0,0.05)',
  },
  soft: {},
  elevated: {
    '--ds-elevation-1': '0 2px 4px rgba(0,0,0,0.08)',
    '--ds-elevation-2': '0 4px 8px rgba(0,0,0,0.1)',
    '--ds-elevation-3': '0 8px 16px rgba(0,0,0,0.12)',
  },
};

export function appearancePostureToVariables(
  posture: AppearancePostureFields,
): Record<string, string> {
  const vars: Record<string, string> = {};

  if (posture.typePairing) {
    const pairing = TYPE_PAIRINGS[posture.typePairing];
    if (pairing) {
      vars['--ds-font-family-heading'] = withArabicSafeFallback(pairing.heading);
      vars['--ds-font-family-base'] = withArabicSafeFallback(pairing.base);
      if ('mono' in pairing && pairing.mono) {
        vars['--ds-font-family-mono'] = pairing.mono;
      }
      vars['--ds-letter-spacing-heading'] = pairing.headingLs;
      vars['--ds-line-height-display'] = String(pairing.displayLh);
    }
  }

  if (posture.buttonStyle) {
    vars['--ds-radius-button'] = BUTTON_STYLE_RADIUS[posture.buttonStyle];
  }
  if (
    typeof posture.radiusScale === 'number' &&
    Number.isFinite(posture.radiusScale)
  ) {
    vars['--ds-radius-scale'] = String(
      clamp(
        posture.radiusScale,
        TENANT_THEME_RADIUS_SCALE_BOUNDS.min,
        TENANT_THEME_RADIUS_SCALE_BOUNDS.max,
      ),
    );
  }
  if (isDensityPreference(posture.density)) {
    vars[DENSITY_MODE_FACTOR_VARIABLE] = String(
      resolveDensityModeFactor(posture.density),
    );
  }

  const motion = posture.motion;
  if (motion) {
    if (typeof motion.intensity === 'number' && Number.isFinite(motion.intensity)) {
      vars['--ds-motion-intensity'] = String(
        clamp(
          motion.intensity,
          MOTION_DIAL_BOUNDS.intensity.min,
          MOTION_DIAL_BOUNDS.intensity.max,
        ),
      );
    }
    if (
      typeof motion.durationScale === 'number' &&
      Number.isFinite(motion.durationScale)
    ) {
      vars['--ds-motion-duration-scale'] = String(
        clamp(
          motion.durationScale,
          MOTION_DIAL_BOUNDS.durationScale.min,
          MOTION_DIAL_BOUNDS.durationScale.max,
        ),
      );
    }
    if (motion.ambient === 'off' || motion.ambient === 'subtle') {
      vars['--ds-motion-ambient'] = motion.ambient;
    }
  }

  if (posture.elevation) {
    Object.assign(vars, ELEVATION_PRESET[posture.elevation]);
  }

  return vars;
}
