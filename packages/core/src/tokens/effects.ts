/**
 * Effect Tokens
 * Shadows, border radius, opacity, blur, and other visual effects
 */

// ==================== Box Shadows (Elevation System) ====================
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// ==================== Drop Shadows (for filters) ====================
export const dropShadows = {
  sm: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05))',
  md: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06))',
  lg: 'drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1))',
  xl: 'drop-shadow(0 20px 13px rgba(0, 0, 0, 0.03)) drop-shadow(0 8px 5px rgba(0, 0, 0, 0.08))',
  '2xl': 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))',
  none: 'drop-shadow(0 0 #0000)',
} as const;

// ==================== Border Radius ====================
export const borderRadius = {
  none: '0px',
  xs: '0.125rem',  // 2px
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',  // Fully rounded (circles, pills)
} as const;

// ==================== Opacity ====================
export const opacity = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
} as const;

// ==================== Blur ====================
export const blur = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '40px',
} as const;

// ==================== Theme-specific Shadows ====================
export const themeShadows = {
  spotify: {
    card: '0 8px 24px rgba(0, 0, 0, 0.5)',
    hover: '0 16px 32px rgba(0, 0, 0, 0.6)',
    elevated: '0 12px 28px rgba(0, 0, 0, 0.55)',
  },
  stripe: {
    card: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.08)',
    hover: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.12)',
    elevated: '0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.08)',
  },
  airbnb: {
    card: '0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
    hover: '0 2px 4px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.1)',
    elevated: '0 6px 16px rgba(0, 0, 0, 0.12)',
  },
  slack: {
    card: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    hover: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    elevated: '0 10px 20px rgba(0, 0, 0, 0.15)',
  },
  notion: {
    card: '0 1px 3px rgba(0, 0, 0, 0.08)',
    hover: '0 2px 6px rgba(0, 0, 0, 0.12)',
    elevated: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  linear: {
    card: '0 0 0 1px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.04)',
    hover: '0 0 0 1px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.08)',
    elevated: '0 8px 16px rgba(0, 0, 0, 0.08)',
  },
  vercel: {
    card: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05)',
    hover: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.1)',
    elevated: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  base: {
    card: shadows.md,
    hover: shadows.lg,
    elevated: shadows.xl,
  },
} as const;

// ==================== Component-specific Effects ====================
export const componentEffects = {
  button: {
    borderRadius: borderRadius.md,
    shadow: {
      default: shadows.sm,
      hover: shadows.md,
      active: shadows.xs,
    },
  },
  card: {
    borderRadius: borderRadius.lg,
    shadow: {
      default: shadows.md,
      hover: shadows.lg,
    },
  },
  modal: {
    borderRadius: borderRadius.xl,
    shadow: shadows['2xl'],
    backdrop: {
      blur: blur.sm,
      opacity: opacity[50],
    },
  },
  input: {
    borderRadius: borderRadius.md,
    shadow: {
      default: shadows.none,
      focus: shadows.sm,
    },
  },
  dropdown: {
    borderRadius: borderRadius.lg,
    shadow: shadows.xl,
  },
  tooltip: {
    borderRadius: borderRadius.md,
    shadow: shadows.lg,
  },
} as const;

// ==================== Utility Functions ====================

/**
 * Get theme-specific shadow
 */
export function getThemeShadow(
  theme: keyof typeof themeShadows,
  variant: 'card' | 'hover' | 'elevated' = 'card'
): string {
  return themeShadows[theme][variant];
}

/**
 * Create custom shadow
 */
export function createShadow(
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  color: string,
  inset = false
): string {
  return `${inset ? 'inset ' : ''}${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
}

/**
 * Combine multiple shadows
 */
export function combineShadows(...shadows: string[]): string {
  return shadows.join(', ');
}

// ==================== Type Exports ====================
export type ShadowKey = keyof typeof shadows;
export type BorderRadiusKey = keyof typeof borderRadius;
export type OpacityKey = keyof typeof opacity;
export type BlurKey = keyof typeof blur;
export type ThemeName = keyof typeof themeShadows;
