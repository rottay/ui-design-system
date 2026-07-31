'use client';

/**
 * @fileoverview Modern EmptyState pattern.
 *
 * A framed, responsive placeholder with semantic visual, clear copy hierarchy
 * and a deliberate action tray. All aesthetic tenor is token-controlled and
 * lives in the modern skin (`runtime/engines/modern/skin/empty-state.css`).
 *
 * PATTERN ↔ PRIMITIVE RELATIONSHIP: this pattern is the RICH standalone
 * placeholder kit (title heading, visual well with semantic fallback icon or
 * caller image, up to two actions, size ramp). The certified Empty primitive
 * (P09) is the minimal embeddable slot (image + description) that OTHER
 * patterns compose inside their own empty branches — different scopes, no
 * recreation. The composition gap that did exist here was the action tray:
 * it rendered raw `<button>` elements. Those now compose the certified
 * Button primitive (htmlType="button" keeps the anatomy-test pin); the
 * pattern owns no control paint.
 *
 * Context variants (no-results / error / offline / permission), retry and
 * collapsible error detail are NOT in the contract — documented, not
 * invented. The pattern owns zero copy (title/description/labels are caller
 * props), so there is no i18n surface.
 *
 * @module Patterns/EmptyState/Engines/Modern
 * @category Patterns
 * @package @rottay/design-system
 */

import React from 'react';
import type { EmptyStateProps } from '../../contracts';
import { Button } from '../../../../../primitives/inputs/Button';
import { CommunicationInboxIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-inbox';

const iconSizes = {
  sm: 24,
  md: 32,
  lg: 40,
};

export default function ModernEmptyState(props: EmptyStateProps) {
  const {
    icon,
    title,
    description,
    action,
    secondaryAction,
    image,
    size = 'md',
    loading,
    className,
    style,
  } = props;

  if (loading) {
    return (
      <div
        className={`ds-pattern-empty-state ds-engine-modern ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        data-size={size}
        data-has-action={false}
        style={style}
        role="status"
        aria-live="polite"
      >
        <span className="ds-empty-state__spinner" data-part="spinner" />
      </div>
    );
  }

  return (
    <div
      className={`ds-pattern-empty-state ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      data-size={size}
      data-visual={image ? 'image' : icon ? 'custom-icon' : 'semantic-icon'}
      data-has-description={Boolean(description)}
      data-has-action={Boolean(action || secondaryAction)}
      style={style}
      role="status"
      aria-live="polite"
    >
      <div className="ds-empty-state__content" data-part="content">
        <div className="ds-empty-state__visual" data-part="visual">
          {image ? (
            <img data-part="image" src={image} alt="" />
          ) : icon ? (
            <span data-part="icon">{icon}</span>
          ) : (
            /* The semantic fallback occupies the same icon slot as a custom
               icon, so the skin paints one anatomy, never two. */
            <span data-part="icon">
              <CommunicationInboxIcon decorative size={iconSizes[size]} />
            </span>
          )}
        </div>

        <div className="ds-empty-state__copy" data-part="copy">
          <h2 data-part="title">{title}</h2>
          {description && <p data-part="description">{description}</p>}
        </div>

        {(action || secondaryAction) && (
          <div className="ds-empty-state__actions" data-part="actions">
            {action && (
              <Button
                engine="modern"
                htmlType="button"
                variant={action.variant ?? 'default'}
                className="ds-empty-state__action"
                data-part="action"
                data-variant={action.variant ?? 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                engine="modern"
                htmlType="button"
                variant="default"
                className="ds-empty-state__secondary-action"
                data-part="secondary-action"
                data-variant="default"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
