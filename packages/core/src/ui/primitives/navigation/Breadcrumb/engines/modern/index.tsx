/**
 * @fileoverview Breadcrumb Modern Engine
 * @description Self-contained, token-driven breadcrumb navigation.
 */

'use client';

import React from 'react';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { BreadcrumbProps, BreadcrumbItem } from '../../contracts';
import { NavigationForwardIcon } from '@/graphics/icons/presentation/semantic/generated/roles/navigation-forward';

/**
 * Modern breadcrumbs render their own anatomy instead of delegating visual
 * behavior to DaisyUI. This keeps separators, interaction and tenant styling
 * deterministic across applications.
 *
 * Interaction contract: items with `href` render as anchors; items with only
 * `onClick` render as real buttons (keyboard-reachable, correct role); the
 * current page and the truncation ellipsis stay inert spans.
 */
export default function ModernBreadcrumb(props: BreadcrumbProps): React.ReactElement {
  const translation = useOptionalTranslation('common');
  const { items, separator, maxItems, className = '', style } = props;

  const displayItems: BreadcrumbItem[] =
    maxItems && maxItems >= 3 && items.length > maxItems
      ? [...items.slice(0, 1), { key: 'ellipsis', label: '…' }, ...items.slice(-(maxItems - 2))]
      : items;

  const separatorNode = separator ?? <NavigationForwardIcon decorative size={12} />;

  return (
    <nav
      className={`rottay-breadcrumb-shell rottay-breadcrumb-shell--modern ${className}`.trim()}
      style={style}
      data-part="root"
      data-truncated={displayItems.length !== items.length || undefined}
      data-count={displayItems.length}
      aria-label={translation?.t('breadcrumb') ?? 'Breadcrumb'}
    >
      <ol data-part="list">
        {displayItems.map((item, index) => {
          const isCurrent = index === displayItems.length - 1;
          const isEllipsis = item.key === 'ellipsis';

          return (
            <React.Fragment key={item.key}>
              {index > 0 && (
                <li data-part="separator" aria-hidden="true">
                  {separatorNode}
                </li>
              )}
              <li data-part="item" data-ellipsis={isEllipsis || undefined}>
                {item.href && !isCurrent ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    data-part="crumb"
                    data-current="false"
                    data-clickable="true"
                  >
                    {item.icon && <span data-part="icon">{item.icon}</span>}
                    <span data-part="label">{item.label}</span>
                  </a>
                ) : item.onClick && !isCurrent ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    data-part="crumb"
                    data-current="false"
                    data-clickable="true"
                  >
                    {item.icon && <span data-part="icon">{item.icon}</span>}
                    <span data-part="label">{item.label}</span>
                  </button>
                ) : (
                  <span
                    data-part="crumb"
                    data-current={isCurrent ? 'true' : 'false'}
                    data-clickable={item.onClick ? 'true' : undefined}
                    aria-current={isCurrent ? 'page' : undefined}
                    onClick={item.onClick}
                  >
                    {item.icon && <span data-part="icon">{item.icon}</span>}
                    <span data-part="label">{item.label}</span>
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

ModernBreadcrumb.displayName = 'ModernBreadcrumb';
