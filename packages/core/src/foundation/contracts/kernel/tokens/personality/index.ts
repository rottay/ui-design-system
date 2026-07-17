/**
 * @fileoverview Personality Token contracts - Rottay Design System
 * @description Tenant-agnostic personality dimensions that drive visual
 * differentiation without branching on engine or tenant names.
 *
 * @remarks
 * Personality tokens are the high-level language of visual identity. The same
 * component code renders formal (BitHire), futuristic (Rottay), or playful
 * (Evnto) simply by changing these tokens in TenantConfig.
 *
 * Five personality dimensions:
 * - **animation** - Entrance, stagger, hover, spring, skeleton style
 * - **chart** - Line style, dots, gradient fills, tooltip style
 * - **typography** - Heading weight, letter spacing, label casing
 * - **accent** - Bar position/style, icon shape, badge shape, divider style
 * - **card** - Elevation, hover behavior, border, padding density
 *
 * Components should read these semantics (e.g., `tokens.personality.animation.hoverLift`)
 * rather than branching on tenant or engine names.
 *
 * @module Contracts/Tokens/Personality
 * @category Types
 * @package @rottay/design-system
 */

// Animation tokens are the most complex personality dimension because they
// influence both CSS transitions (via CSS variables) and JS animation libraries
// (Motion for React, react-spring). The dual representation is why we have both
// CSS-friendly strings (entrance, pulseSpeed) and numeric values (springTension).

/** Animation personality tokens */
export interface AnimationPersonalityTokens {
  /** Intensity general (0=none, 0.5=subtle, 1=full, 1.5=exaggerated) */
  intensity: number;
  /** Delay between sequential items (ms) */
  staggerDelay: number;
  /** Maximum stagger for lists (ms) */
  staggerMax: number;
  /** Entrance animation style */
  entrance: 'none' | 'fade' | 'slideUp' | 'spring' | 'bounce';
  /** Entrance animation duration (ms) */
  entranceDuration: number;
  /** Hover lift in px (0 = no lift) */
  hoverLift: number;
  /** Hover scale (1 = no scale, 1.02 = subtle) */
  hoverScale: number;
  /** Use spring physics */
  useSpring: boolean;
  /** Spring tension for react-spring */
  springTension: number;
  /** Spring friction for react-spring */
  springFriction: number;
  /** Pulse speed for live indicators */
  pulseSpeed: 'none' | 'slow' | 'normal' | 'fast';
  /** Skeleton loading style */
  skeletonStyle: 'pulse' | 'shimmer' | 'wave';
  /** KPI count-up animation enabled */
  countUpEnabled: boolean;
}

/** Chart personality tokens */
export interface ChartPersonalityTokens {
  /** Animate charts on mount */
  animateOnMount: boolean;
  /** Mount animation duration (ms) */
  mountDuration: number;
  /** Line style */
  lineStyle: 'sharp' | 'smooth' | 'step';
  /** Show dots on data points */
  showDots: boolean;
  /** Use gradient fills in areas */
  useGradientFill: boolean;
  /** Tooltip style */
  tooltipStyle: 'minimal' | 'detailed' | 'glass';
  /** Color scheme for chart palettes */
  colorScheme?: 'default' | 'pastel' | 'vibrant' | 'monochrome' | 'accessible';
}

/** Typography personality tokens */
export interface TypographyPersonalityTokens {
  /** Heading weight bias (-100/0/+100) */
  headingWeightBias: 'lighter' | 'normal' | 'heavier';
  /** Heading letter spacing */
  headingLetterSpacing: string;
  /** Label style (UPPERCASE vs sentence case) */
  labelStyle: 'uppercase' | 'sentence' | 'capitalize';
}

/** Accent/decoration personality tokens */
export interface AccentPersonalityTokens {
  /** Accent bar position on cards */
  barPosition: 'top' | 'left' | 'none';
  /** Accent bar thickness (px) */
  barThickness: number;
  /** Accent bar style */
  barStyle: 'solid' | 'gradient' | 'animated';
  /** Icon container shape */
  iconContainerShape: 'square' | 'rounded' | 'circle' | 'none';
  /** Badge shape */
  badgeShape: 'rounded' | 'pill' | 'square';
  /** Divider style */
  dividerStyle: 'solid' | 'dashed' | 'dotted' | 'none';
}

/** Card personality tokens */
export interface CardPersonalityTokens {
  /** Default elevation */
  defaultElevation: 'sm' | 'md' | 'lg';
  /** Hover elevation change */
  hoverElevation: 'none' | 'lift-one' | 'lift-two';
  /** Show border at rest */
  showBorder: boolean;
  /** Color tint on hover */
  hoverTint: boolean;
  /** Padding density */
  paddingDensity: 'compact' | 'normal' | 'spacious';
}

// Each sub-object is independently spreadable in the merge chain
// (DEFAULT -> vertical -> profile -> tenant). This means a tenant that only
// customizes `card` does not need to provide `animation`, `chart`, etc.
/** Complete set of personality tokens */
export interface PersonalityTokens {
  animation: AnimationPersonalityTokens;
  chart: ChartPersonalityTokens;
  typography: TypographyPersonalityTokens;
  accent: AccentPersonalityTokens;
  card: CardPersonalityTokens;
}
