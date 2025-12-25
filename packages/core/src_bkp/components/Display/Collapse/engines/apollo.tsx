'use client';

/**
 * Apollo Collapse Engine
 *
 * Native HTML + Tailwind implementation with unified props interface.
 */

import { useState, useCallback } from 'react';
import type { CollapseProps, CollapseItem } from '../types';
import {
  normalizeActiveKey,
  isPanelActive,
  toggleAccordion,
  toggleMultiple,
} from '../../../../types/components/collapse';

/**
 * Apollo Collapse Component
 *
 * Pure Tailwind-styled accordion/collapse.
 */
export default function ApolloCollapse(props: CollapseProps) {
  const {
    items = [],
    activeKey: controlledActiveKey,
    defaultActiveKey,
    accordion = false,
    bordered = true,
    size = 'middle',
    expandIconPosition = 'start',
    ghost = false,
    collapsible = 'header',
    destroyInactivePanel = false,
    onChange,
    className = '',
    style,
  } = props;

  const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(
    normalizeActiveKey(defaultActiveKey)
  );

  const activeKeys = controlledActiveKey !== undefined
    ? normalizeActiveKey(controlledActiveKey)
    : internalActiveKeys;

  const handleToggle = useCallback(
    (key: string) => {
      const newKeys = accordion
        ? toggleAccordion(key, activeKeys)
        : toggleMultiple(key, activeKeys);

      if (controlledActiveKey === undefined) {
        setInternalActiveKeys(newKeys);
      }

      onChange?.(accordion ? (newKeys[0] ?? '') : newKeys);
    },
    [accordion, activeKeys, controlledActiveKey, onChange]
  );

  // Size classes
  const sizeClasses = {
    small: 'text-sm',
    middle: 'text-base',
    large: 'text-lg',
  };

  const containerClasses = [
    'w-full divide-y divide-gray-200',
    bordered && !ghost ? 'border border-gray-200 rounded-lg overflow-hidden' : '',
    ghost ? 'bg-transparent border-0' : '',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={style}>
      {items.map((item) => {
        const isActive = isPanelActive(item.key, activeKeys);
        const isDisabled = item.disabled || collapsible === 'disabled' || item.collapsible === 'disabled';
        const canClickHeader = collapsible === 'header' || item.collapsible === 'header';
        const canClickIcon = collapsible === 'icon' || item.collapsible === 'icon';

        return (
          <div
            key={item.key}
            className={[
              ghost ? 'bg-transparent' : 'bg-white',
              item.className ?? '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={item.style}
          >
            {/* Header */}
            <button
              type="button"
              className={[
                'w-full flex items-center gap-3 px-4 py-3 text-left',
                'transition-colors duration-200',
                expandIconPosition === 'end' ? 'flex-row-reverse justify-between' : '',
                isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50 cursor-pointer',
                item.headerClass ?? '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={isDisabled}
              onClick={() => canClickHeader && !isDisabled && handleToggle(String(item.key))}
            >
              {/* Expand icon */}
              {(item.showArrow !== false) && (
                <svg
                  className={[
                    'w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0',
                    isActive ? 'rotate-90' : '',
                    canClickIcon && !canClickHeader ? 'cursor-pointer hover:text-gray-700' : '',
                  ].join(' ')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  onClick={(e) => {
                    if (canClickIcon && !canClickHeader) {
                      e.stopPropagation();
                      !isDisabled && handleToggle(String(item.key));
                    }
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}

              {/* Label */}
              <span className="flex-1 font-medium text-gray-900">{item.label}</span>

              {/* Extra */}
              {item.extra && (
                <span
                  className="text-gray-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.extra}
                </span>
              )}
            </button>

            {/* Content */}
            <div
              className={[
                'overflow-hidden transition-all duration-200',
                isActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
              ].join(' ')}
            >
              {(!destroyInactivePanel || isActive) && (
                <div className="px-4 pb-4 pt-0 text-gray-600">
                  {item.children}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
