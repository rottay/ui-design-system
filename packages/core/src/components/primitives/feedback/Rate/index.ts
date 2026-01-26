'use client';

/**
 * @fileoverview Rate Component - Rottay Design System
 * @description A star rating component for collecting user ratings and feedback.
 * Part of the Rottay Design System's feedback primitives collection.
 *
 * @remarks
 * The Rate component is built on Rottay's multi-engine architecture, allowing
 * seamless rendering across Titan (Ant Design), Hermes (DaisyUI), and Apollo
 * (Vanilla) engines. This ensures consistent behavior while adapting to your
 * project's styling framework.
 *
 * Multi-tenant theming is fully supported - rating styling automatically adapts
 * to your tenant's brand colors, spacing, and typography tokens.
 *
 * @example Basic Usage
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * function MyComponent() {
 *   const [value, setValue] = useState(3);
 *
 *   return (
 *     <Rate value={value} onChange={setValue} />
 *   );
 * }
 * ```
 *
 * @example Half Star Ratings
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * // Allow half-star selections for more precise ratings
 * <Rate allowHalf defaultValue={2.5} />
 * ```
 *
 * @example Custom Icons
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 * import { HeartIcon } from './icons';
 *
 * // Use custom character for rating icons
 * <Rate character={<HeartIcon />} defaultValue={3} />
 *
 * // Dynamic character based on index
 * <Rate
 *   character={({ index }) => index < 3 ? '😀' : '🌟'}
 *   count={5}
 *   defaultValue={4}
 * />
 * ```
 *
 * @example Read-Only Display
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * // Display rating without interaction (e.g., showing product ratings)
 * <Rate value={4.5} readOnly allowHalf />
 * ```
 *
 * @example With Tooltips
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * // Show tooltips on hover for each star
 * <Rate
 *   tooltips={['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']}
 *   defaultValue={3}
 * />
 * ```
 *
 * @example Custom Colors
 * ```tsx
 * import { Rate } from '@rottay/design-system';
 *
 * // Customize active and inactive colors
 * <Rate
 *   activeColor="#ff4d4f"
 *   inactiveColor="#e8e8e8"
 *   defaultValue={3}
 * />
 * ```
 *
 * @example Multi-Tenant Theming
 * ```tsx
 * // Rate automatically inherits tenant theme
 * <ThemeProvider tenant="acme-corp">
 *   <Rate defaultValue={4} />
 *   {/* Uses ACME Corp's brand colors and styling *\/}
 * </ThemeProvider>
 * ```
 *
 * @example Engine Override
 * ```tsx
 * // Force a specific rendering engine
 * <Rate engine="hermes" defaultValue={3} />
 * {/* Renders with DaisyUI/Tailwind styling *\/}
 * ```
 *
 * @see {@link RateProps} for complete prop documentation
 * @see {@link BaseRate} for base component implementation
 * @see {@link Progress} for related feedback component
 * @see {@link Slider} for continuous value selection
 *
 * @module Rate
 * @category Feedback
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
import type { RateProps } from './types';

// ============================================================================
// Type Exports
// ============================================================================

export type {
  RateProps,
  RateSize,
  RateEngine,
  RateCharacterProps,
} from './types';

export { RATE_DEFAULTS, RATE_SIZE_MAP } from './types';

// ============================================================================
// Base Component Export
// ============================================================================

/**
 * Base Rate component export for direct usage.
 * Prefer using the main Rate export which includes engine support.
 * @see {@link BaseRate}
 */

// ============================================================================
// Main Component
// ============================================================================

/**
 * Rate component with multi-engine support.
 *
 * @description
 * A star rating component for collecting user ratings and displaying feedback scores.
 * Ideal for:
 * - Product reviews and ratings
 * - User satisfaction surveys
 * - Skill level indicators
 * - Quality assessments
 * - Feedback collection forms
 *
 * @remarks
 * - Supports controlled and uncontrolled modes
 * - Half-star ratings for precise scoring
 * - Custom characters/icons support
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - Accessible with ARIA radiogroup semantics
 * - Adapts to tenant theming automatically
 *
 * @param props - {@link RateProps}
 * @returns React component with star rating functionality
 *
 * @example
 * ```tsx
 * <Rate
 *   defaultValue={3}
 *   allowHalf
 *   count={5}
 *   tooltips={['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']}
 *   onChange={(value) => console.log('Rating:', value)}
 * />
 * ```
 */
export const Rate = createEngineComponent<RateProps>('Rate', {
  /** Ant Design implementation - full-featured with native Rate component */
  titan: () => import('./engines/titan'),
  /** DaisyUI/Tailwind implementation - utility-first styling */
  hermes: () => import('./engines/hermes'),
  /** Vanilla HTML/CSS implementation - zero dependencies */
  apollo: () => import('./engines/apollo'),
});

export default Rate;
