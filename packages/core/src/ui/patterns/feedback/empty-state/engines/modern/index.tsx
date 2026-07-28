'use client';

/**
 * @fileoverview Modern EmptyState pattern.
 * A framed, responsive placeholder with semantic visual, clear copy hierarchy,
 * and a deliberate action tray. All aesthetic tenor is token-controlled.
 */

import React from 'react';
import type { EmptyStateProps } from '../../contracts';
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
              <button
                type="button"
                className="ds-empty-state__action"
                data-part="action"
                data-variant={action.variant ?? 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                type="button"
                className="ds-empty-state__secondary-action"
                data-part="secondary-action"
                data-variant="default"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
