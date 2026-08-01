/**
 * @fileoverview Modern Link Engine - Rottay Design System
 * @description Token-driven link painted by the unlayered modern skin.
 *
 * @remarks
 * All paint -- variant ink, underline treatment, hover/pressed/visited/focus
 * states, disabled policy, and the external-affordance icon -- lives in
 * `foundation/tokens/css/runtime/engines/modern/skin/link.css`, keyed on the
 * `rottay-link-shell rottay-link-shell--modern` scope and the `data-*` contract
 * stamped below. No DaisyUI `link`/`link-*` classes and no Tailwind utilities
 * are used: identical markup renders identically in apps that compile different
 * utility sets.
 *
 * @example
 * ```tsx
 * import { Link } from '@rottay/design-system';
 *
 * <Link engine="modern" href="https://github.com" external>
 *   View on GitHub
 * </Link>
 * ```
 *
 * @see {@link LinkProps} for prop documentation
 * @module Link/engines/modern
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { VisuallyHidden } from '../../../../foundation';
import { ActionOpenExternalIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-open-external';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { LinkProps } from '../../contracts';
import { LINK_DEFAULTS } from '../../contracts';

/**
 * Modern engine Link component painted by the modern skin.
 *
 * @description
 * Renders a native anchor whose every visual decision is owned by the skin.
 * External links gain the semantic open-external affordance icon (mirrored in
 * RTL by the skin) alongside the `target`/`rel` security attributes; disabled
 * links drop `href`, suppress navigation, and let the skin mute the ink.
 *
 * @param props - {@link LinkProps}
 * @returns Native anchor element stamped with the skin's data contract
 *
 * @example
 * ```tsx
 * <ModernLink href="/dashboard" type="primary" underline>
 *   Go to Dashboard
 * </ModernLink>
 * ```
 */
export default function ModernLink(props: LinkProps): React.ReactElement {
  const {
    children,
    href,
    type = LINK_DEFAULTS.type,
    disabled = LINK_DEFAULTS.disabled,
    underline = LINK_DEFAULTS.underline,
    external = LINK_DEFAULTS.external,
    externalIcon = LINK_DEFAULTS.externalIcon,
    className = '',
    style,
    onClick,
    ...rest
  } = props;

  /**
   * Handle click events on the link.
   * Prevents navigation when the link is disabled.
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  /** Security attributes for external links */
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  /**
   * External announcements: the icon is a visual affordance, so screen-reader
   * users get the same information as text. Catalog-first with the documented
   * English floor (the key lands with the locale JSONs; the echo guard falls
   * back until then).
   */
  const i18n = useOptionalTranslation('common');
  const newTabText = i18n?.tOr('opens_in_new_tab', '(opens in new tab)') ?? '(opens in new tab)';

  return (
    <a
      href={disabled ? undefined : href}
      className={`rottay-link-shell rottay-link-shell--modern ${className}`.trim()}
      onClick={handleClick}
      // aria-disabled only when actually disabled (B9 pass 2): stamping
      // aria-disabled="false" on every enabled link is AOM noise. Consumers
      // mark the current location with `aria-current` through the rest
      // props; the skin paints that state (weight + underline grade, never
      // color alone).
      aria-disabled={disabled || undefined}
      data-part="root"
      data-variant={type}
      data-underline={underline ? 'true' : 'false'}
      data-disabled={disabled || undefined}
      data-external={external || undefined}
      style={style}
      {...externalProps}
      {...rest}
    >
      {children}
      {external && externalIcon && (
        <span data-part="external-icon" aria-hidden="true">
          <ActionOpenExternalIcon size={12} decorative />
        </span>
      )}
      {external && <VisuallyHidden>{newTabText}</VisuallyHidden>}
    </a>
  );
}

/** Set display name for React DevTools debugging */
ModernLink.displayName = 'ModernLink';
