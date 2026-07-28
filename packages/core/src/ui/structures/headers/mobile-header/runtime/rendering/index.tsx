'use client';

/**
 * @fileoverview MobileHeader - compact mobile navigation header.
 *
 * @description
 * A 56px-tall header bar with three slots: left action (back button or custom),
 * center title (truncated), and right actions. Supports sticky positioning with
 * safe area insets for notched devices.
 *
 * Engine-agnostic: composes DS primitives (Box, Flex, Text) which resolve
 * through the engine system themselves.
 *
 * @example
 * ```tsx
 * <MobileHeader
 *   title="Order Details"
 *   onBack={() => router.back()}
 *   rightActions={<Button size="sm" variant="ghost">Edit</Button>}
 *   sticky
 * />
 * ```
 *
 * @module Structures/Headers/MobileHeader
 * @category Structure
 * @package @rottay/design-system
 */

import type { CSSProperties } from 'react';

import { Box } from '@/ui/primitives/layout/Box';
import { Flex } from '@/ui/primitives/layout/Flex';
import { Text } from '@/ui/primitives/display/Typography';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

import type { MobileHeaderProps } from '../../contracts';

// ---------------------------------------------------------------------------
// Back arrow SVG (inline to avoid icon library dependency)
// ---------------------------------------------------------------------------

function BackArrowIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Compact header bar for mobile screens.
 *
 * Renders a 56px-height bar with left action, centered title, and right action
 * slots. When `onBack` is provided and no custom `leftAction`, a back arrow
 * button is rendered automatically.
 */
export function MobileHeader({
  title,
  leftAction,
  rightActions,
  onBack,
  sticky = false,
  style,
  children,
}: MobileHeaderProps) {
  // Accessible back-button label via the DS i18n channel with an English floor.
  const i18n = useOptionalTranslation('common');
  const backAriaLabel = i18n?.tOr('go_back', 'Go back') ?? 'Go back';

  // Determine the left slot content
  const leftSlot = leftAction ?? (
    onBack ? (
      <Box
        as="button"
        type="button"
        onClick={onBack}
        className="rottay-mobile-header__back"
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 44,
          minHeight: 44,
          padding: 0,
        } as CSSProperties}
        aria-label={backAriaLabel}
        data-testid="mobile-header-back"
        data-part="trigger"
      >
        <BackArrowIcon />
      </Box>
    ) : null
  );

  const containerStyle: CSSProperties = {
    width: '100%',
    height: 56,
    minHeight: 56,
    paddingTop: 'env(safe-area-inset-top, 0px)',
    ...(sticky
      ? {
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }
      : {}),
    ...style,
  };

  return (
    <Box
      as="header"
      className="rottay-mobile-header"
      style={containerStyle}
      data-testid="mobile-header"
      role="banner"
      data-part="root"
      data-sticky={sticky}
    >
      <Flex
        align="center"
        justify="between"
        style={{
          height: '100%',
          paddingInlineStart: 4,
          paddingInlineEnd: 4,
          position: 'relative',
        }}
      >
        {/* Left slot */}
        <Box
          style={{
            flexShrink: 0,
            minWidth: 44,
            display: 'flex',
            alignItems: 'center',
          }}
          data-testid="mobile-header-left"
          data-part="left"
        >
          {leftSlot}
        </Box>

        {/* Center title */}
        <Box
          style={{
            flex: 1,
            overflow: 'hidden',
            textAlign: 'center',
            paddingInlineStart: 8,
            paddingInlineEnd: 8,
          }}
        >
          {title && (
            <Text
              className="rottay-mobile-header__title"
              style={{
                fontSize: 17,
                fontWeight: 600,
                lineHeight: '22px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              data-testid="mobile-header-title"
              data-part="label"
            >
              {title}
            </Text>
          )}
        </Box>

        {/* Right slot */}
        <Box
          style={{
            flexShrink: 0,
            minWidth: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
          data-testid="mobile-header-right"
          data-part="right"
        >
          {rightActions}
        </Box>
      </Flex>

      {/* Optional children below the header bar (subtitle, search, etc.) */}
      {children}
    </Box>
  );
}

MobileHeader.displayName = 'MobileHeader';

export default MobileHeader;
