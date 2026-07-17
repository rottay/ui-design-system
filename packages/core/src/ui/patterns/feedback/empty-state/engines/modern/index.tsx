'use client';

/**
 * @fileoverview EmptyState -- Modern engine (DaisyUI / Tailwind).
 * Centered empty-state using DaisyUI's "hero" layout for vertical
 * centering with responsive text sizing. Includes a fallback SVG
 * empty-box icon when no custom icon or image is provided.
 * Supports three size presets (sm/md/lg) via Tailwind utility classes.
 *
 * @example
 * <ModernEmptyState
 *   title="No results found"
 *   description="Try adjusting your search filters."
 *   action={{ label: 'Reset', onClick: reset, variant: 'primary' }}
 *   size="md"
 * />
 */

import React from 'react';
import type { EmptyStateProps } from '../../contracts';

/** Tailwind class presets for each size tier -- controls padding, icon, text, and button sizing */
const sizeClasses = {
  sm: { wrapper: 'py-6', icon: 'text-3xl', title: 'text-sm', desc: 'text-xs', btnStyle: { height: 32, padding: '0 12px', fontSize: 13 } as React.CSSProperties },
  md: { wrapper: 'py-12', icon: 'text-5xl', title: 'text-lg', desc: 'text-sm', btnStyle: { height: 36, padding: '0 16px', fontSize: 14 } as React.CSSProperties },
  lg: { wrapper: 'py-16', icon: 'text-7xl', title: 'text-2xl', desc: 'text-base', btnStyle: { height: 44, padding: '0 20px', fontSize: 16 } as React.CSSProperties },
};

/**
 * Modern (DaisyUI/Tailwind) implementation of the EmptyState pattern.
 * Uses DaisyUI's hero component for centered layout and provides a
 * built-in SVG fallback icon when no custom visual is supplied.
 *
 * @param props - See {@link EmptyStateProps} for the full prop contract.
 * @returns The rendered empty state.
 */
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

  /* Resolve Tailwind class set for the chosen size tier */
  const s = sizeClasses[size];

  /* DaisyUI loading-spinner replaces content while data is fetching */
  if (loading) {
    return (
      <div
        className={`ds-pattern-empty-state ds-engine-modern flex justify-center items-center ${s.wrapper} ${className ?? ''}`}
        data-part="root"
        data-loading={true}
        style={style}
      >
        <span className="ds-empty-state__spinner" data-part="spinner" style={{ display: 'inline-block', width: 24, height: 24, animation: 'ds-spin var(--ds-motion-glacial) linear infinite' }} />
      </div>
    );
  }

  return (
    <div
      className={`${s.wrapper} ds-pattern-empty-state ds-engine-modern ${className ?? ''}`}
      data-part="root"
      data-loading={false}
      style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="text-center">
        <div className="max-w-md">
          {/* Image takes priority, then custom icon, then a built-in SVG empty-box fallback */}
          {image ? (
            <img data-part="image" src={image} alt={title} className="mx-auto mb-4 max-h-40 object-contain" />
          ) : icon ? (
            <div data-part="icon" className={`${s.icon} mb-4 opacity-40`}>{icon}</div>
          ) : (
            /* Default empty-box SVG rendered at very low opacity to stay unobtrusive */
            <div data-part="icon" className={`${s.icon} mb-4 opacity-20`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          )}
          {/* Title is always rendered; description is conditional */}
          <h2 data-part="title" className={`font-bold ${s.title}`}>{title}</h2>
          {description && <p data-part="description" className={`${s.desc} opacity-60 mt-2`}>{description}</p>}
          {/* Action row only mounts when at least one action is provided */}
          {(action || secondaryAction) && (
            <div className="flex justify-center gap-2 mt-6">
              {/* Primary action uses primary DS tokens when variant is "primary"; otherwise ghost */}
              {action && (
                <button
                  className="ds-empty-state__action"
                  data-part="action"
                  data-variant={action.variant ?? 'default'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    ...s.btnStyle,
                  }}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              )}
              {/* Secondary action is always ghost-styled to visually de-emphasize it */}
              {secondaryAction && (
                <button
                  className="ds-empty-state__secondary-action"
                  data-part="secondary-action"
                  data-variant="default"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    ...s.btnStyle,
                  }}
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
