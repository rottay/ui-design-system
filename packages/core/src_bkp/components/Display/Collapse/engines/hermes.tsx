'use client';

/**
 * Hermes Collapse Engine
 *
 * DaisyUI implementation with unified props interface.
 */

import { useState, useCallback, useMemo } from 'react';
import type { CollapseProps, CollapseItem } from '../types';
import {
  normalizeActiveKey,
  isPanelActive,
  toggleAccordion,
  toggleMultiple,
} from '../../../../types/components/collapse';

/**
 * Hermes Collapse Component
 *
 * DaisyUI-styled accordion/collapse.
 */
export default function HermesCollapse(props: CollapseProps) {
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
    'w-full',
    bordered && !ghost ? 'border border-base-300 rounded-box' : '',
    ghost ? 'bg-transparent' : '',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={style}>
      {items.map((item, index) => {
        const isActive = isPanelActive(item.key, activeKeys);
        const isDisabled = item.disabled || collapsible === 'disabled' || item.collapsible === 'disabled';
        const canClickHeader = collapsible === 'header' || item.collapsible === 'header';
        const canClickIcon = collapsible === 'icon' || item.collapsible === 'icon';

        return (
          <div
            key={item.key}
            className={[
              'collapse',
              accordion ? 'collapse-arrow' : 'collapse-arrow',
              bordered && !ghost && index > 0 ? 'border-t border-base-300' : '',
              ghost ? 'bg-transparent' : 'bg-base-100',
              item.className ?? '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={item.style}
          >
            {/* Hidden checkbox for toggle functionality */}
            <input
              type={accordion ? 'radio' : 'checkbox'}
              name={accordion ? `collapse-group-${Math.random()}` : undefined}
              checked={isActive}
              disabled={isDisabled}
              onChange={() => !isDisabled && handleToggle(String(item.key))}
              className="peer"
            />

            {/* Header */}
            <div
              className={[
                'collapse-title font-medium flex items-center gap-2',
                expandIconPosition === 'end' ? 'flex-row-reverse justify-between' : '',
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                item.headerClass ?? '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => canClickHeader && !isDisabled && handleToggle(String(item.key))}
            >
              {/* Expand icon */}
              {(item.showArrow !== false) && (
                <svg
                  className={[
                    'w-4 h-4 transition-transform duration-200',
                    isActive ? 'rotate-90' : '',
                    canClickIcon && !canClickHeader ? 'cursor-pointer' : '',
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
              <span className="flex-1">{item.label}</span>

              {/* Extra */}
              {item.extra && (
                <span onClick={(e) => e.stopPropagation()}>{item.extra}</span>
              )}
            </div>

            {/* Content */}
            <div className="collapse-content">
              {(!destroyInactivePanel || isActive) && item.children}
            </div>
          </div>
        );
      })}
    </div>
  );
}
