import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';

/**
 * Canonical structural and motion axes for every bundled/custom Evnto path.
 *
 * BrandTheme, vertical, and product-profile registries intentionally retain
 * these exact references. Every object boundary is frozen so no registry
 * consumer can mutate one path and contaminate or drift the others.
 */
export const EVNTO_CANONICAL_SURFACES = {
  densityScale: 1.125,
  borderRadius: { sm: '10px', md: '14px', lg: '18px', xl: '24px' },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.1)',
  },
  glass: { blur: 'none', background: 'none', border: 'none' },
  gradients: { primary: 'none', surface: 'none', mesh: 'none' },
  overlays: {
    light: 'rgba(0, 0, 0, 0.01)',
    medium: 'rgba(0, 0, 0, 0.03)',
    heavy: 'rgba(0, 0, 0, 0.06)',
  },
} satisfies NonNullable<BrandTheme['surfaces']>;

Object.freeze(EVNTO_CANONICAL_SURFACES.borderRadius);
Object.freeze(EVNTO_CANONICAL_SURFACES.shadows);
Object.freeze(EVNTO_CANONICAL_SURFACES.glass);
Object.freeze(EVNTO_CANONICAL_SURFACES.gradients);
Object.freeze(EVNTO_CANONICAL_SURFACES.overlays);
Object.freeze(EVNTO_CANONICAL_SURFACES);

export const EVNTO_CANONICAL_MOTION = {
  intensity: 1.5,
  entrance: 'slideUp',
  entranceDuration: 350,
  hoverLift: 4,
  hoverScale: 1.03,
  useSpring: true,
  springTension: 200,
  springFriction: 18,
  staggerDelay: 80,
  staggerMax: 600,
  pulseSpeed: 'fast',
  skeletonStyle: 'wave',
  countUpEnabled: true,
} satisfies NonNullable<BrandTheme['motion']>;

Object.freeze(EVNTO_CANONICAL_MOTION);
