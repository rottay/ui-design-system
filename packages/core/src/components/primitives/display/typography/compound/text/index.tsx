/**
 * @fileoverview Typography.Text Compound - Rottay Design System
 * @description Engine-aware inline text component with decorations.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The TypographyText component provides inline text with customizable
 * appearance, decorations, and flexible element rendering.
 *
 * **Features:**
 * - Multiple sizes and font weights
 * - Semantic color variants
 * - Text decorations (underline, strikethrough, italic)
 * - Monospace font for code
 * - Flexible element rendering (span, p, div, label)
 * - Line clamping and truncation
 * - Engine-aware rendering
 *
 * **Use Cases:**
 * - Inline emphasized text
 * - Code snippets
 * - Labels and annotations
 * - Styled links
 *
 * @example Basic Usage
 * ```tsx
 * <Typography.Text color="primary" weight="semibold">
 *   Important text
 * </Typography.Text>
 * ```
 *
 * @example With Decorations
 * ```tsx
 * <Typography.Text underline italic color="muted">
 *   Emphasized note
 * </Typography.Text>
 * ```
 *
 * @example Code Style
 * ```tsx
 * <Typography.Text monospace color="error">
 *   console.error('message')
 * </Typography.Text>
 * ```
 *
 * @see {@link Typography} for the main namespace
 * @see {@link TextProps} for available props
 * @module Typography/compound/text
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import { useOptionalTokens } from '@/infrastructure/runtime/theming/composition/react/tokens';
import {
  mergePersonalityStyle,
  resolveTypographyTextStyle,
} from '@/foundation/tokens/ts/runtime/personality';
import {
  createSyncEngineComponent,
  type SyncEngineImplementations,
} from '../../../../../../infrastructure/runtime/engines/presentation/component-factory/sync';
import type { TextProps } from '../../contracts';
import { ClassicText } from '../../engines/classic';
import { ModernText } from '../../engines/modern';
import { RusticText } from '../../engines/rustic';

type TextImplementation = ForwardRefExoticComponent<TextProps & RefAttributes<HTMLElement>>;

/**
 * Engine resolution goes through the factory, so `custom` reaches a registered
 * component pack under the name `Text` exactly as every lazy family does. The
 * SYNC factory is what keeps typography out of a Suspense boundary: it renders
 * inside every other component's tree and must not flash on first paint.
 */
const TextImplementations: SyncEngineImplementations<TextProps> = {
  classic: ClassicText,
  modern: ModernText,
  rustic: RusticText,
};

const ResolvedText = createSyncEngineComponent<TextProps>(
  'Text',
  TextImplementations
);

/**
 * Typography Text component with engine-aware rendering.
 *
 * Renders inline text with customizable appearance, decorations,
 * and flexible element rendering. Supports underline, strikethrough,
 * italic, and monospace styles.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TypographyText>Regular text content</TypographyText>
 *
 * // With styling options
 * <TypographyText size="lg" color="primary" weight="semibold" italic>
 *   Emphasized important text
 * </TypographyText>
 *
 * // Code-style text
 * <TypographyText monospace color="error">
 *   console.error('Something went wrong')
 * </TypographyText>
 *
 * // With specific engine
 * <TypographyText engine="rustic" underline>
 *   Underlined link text
 * </TypographyText>
 * ```
 *
 * @param props - TextProps including engine, as, size, weight, color, monospace, italic, underline, and children
 * @param ref - Forwarded ref to the underlying inline element (span, p, div, or label)
 * @returns The engine-specific inline text element with personality token styles merged in
 */
export const TypographyText = forwardRef<HTMLElement, TextProps>(
  (props, ref) => {
    // Resolve optional personality tokens from context (if a PersonalityProvider is present)
    const tokens = useOptionalTokens();

    return (
      <ResolvedText
        ref={ref}
        {...props}
        style={mergePersonalityStyle(
          props.style,
          // When as="label", resolveTypographyTextStyle applies label-specific token overrides
          tokens ? resolveTypographyTextStyle(tokens, props.as === 'label') : undefined
        )}
      />
    );
  }
);

TypographyText.displayName = 'Typography.Text';

/**
 * Short alias for direct-entrypoint consumers.
 *
 * The parent `Typography` barrel also publishes this alias, but the governed
 * public entrypoint and every deep import resolve this module directly, so the
 * alias has to exist here or those bindings resolve to `undefined`.
 */
export { TypographyText as Text };
