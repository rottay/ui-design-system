/**
 * Hermes Tabs Engine
 *
 * DaisyUI tabs implementation with unified TabsProps.
 */

'use client';

import { useState } from 'react';
import type { TabsProps } from '../../../../types/components/tabs';

// Map unified size to DaisyUI size classes
const sizeClasses = {
  small: 'tabs-xs',
  default: 'tabs-sm',
  large: 'tabs-lg',
};

// Map unified type to DaisyUI tab styles
const typeClasses = {
  line: 'tabs-bordered',
  card: 'tabs-boxed',
  'editable-card': 'tabs-boxed',
};

/**
 * Hermes Tabs - DaisyUI implementation with unified TabsProps
 */
function HermesTabs({
  items = [],
  activeKey,
  defaultActiveKey,
  onChange,
  className = '',
  style,
  id,
  type = 'line',
  size = 'default',
  onEdit,
  tabBarExtraContent,
  keyboard = true,
  onTabClick,
  'aria-label': ariaLabel,
}: TabsProps) {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey ?? items[0]?.key
  );

  const isControlled = activeKey !== undefined;
  const currentActiveKey = isControlled ? activeKey : internalActiveKey;

  const handleTabClick = (
    key: string,
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    const item = items.find((i) => i.key === key);
    if (item?.disabled) return;

    if (!isControlled) {
      setInternalActiveKey(key);
    }

    onChange?.(key);
    onTabClick?.(key, event);
  };

  const handleKeyDown = (key: string, event: React.KeyboardEvent) => {
    if (!keyboard) return;

    const currentIndex = items.findIndex((item) => item.key === key);
    let newIndex = currentIndex;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    } else if (event.key === 'Home') {
      event.preventDefault();
      newIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      newIndex = items.length - 1;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(key, event);
      return;
    } else {
      return;
    }

    // Find next non-disabled tab
    while (items[newIndex]?.disabled && newIndex !== currentIndex) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'Home') {
        newIndex = newIndex > 0 ? newIndex - 1 : items.length - 1;
      } else {
        newIndex = newIndex < items.length - 1 ? newIndex + 1 : 0;
      }
    }

    if (!items[newIndex]?.disabled) {
      handleTabClick(items[newIndex].key, event);
      // Focus the new tab
      const tabElement = document.querySelector(
        `[data-tab-key="${items[newIndex].key}"]`
      ) as HTMLElement;
      tabElement?.focus();
    }
  };

  const handleClose = (key: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.(key, 'remove');
  };

  const classes = [
    'tabs',
    typeClasses[type] ?? typeClasses.line,
    sizeClasses[size] ?? sizeClasses.default,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const activeItem = items.find((item) => item.key === currentActiveKey);

  return (
    <div className="w-full" style={style} id={id}>
      {/* Tab bar */}
      <div className="flex items-center gap-2">
        <div className={classes} role="tablist" aria-label={ariaLabel}>
          {items.map((item) => {
            const isActive = item.key === currentActiveKey;

            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                data-tab-key={item.key}
                aria-selected={isActive}
                aria-disabled={item.disabled}
                aria-label={typeof item['aria-label'] === 'string' ? item['aria-label'] : undefined}
                tabIndex={isActive ? 0 : -1}
                disabled={item.disabled}
                onClick={(e) => handleTabClick(item.key, e)}
                onKeyDown={(e) => handleKeyDown(item.key, e)}
                className={`tab ${isActive ? 'tab-active' : ''} ${
                  item.disabled ? 'tab-disabled' : ''
                } flex items-center gap-2`}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
                {type === 'editable-card' && item.closable !== false && (
                  <button
                    type="button"
                    onClick={(e) => handleClose(item.key, e)}
                    className="btn btn-ghost btn-xs ml-2"
                    aria-label={`Close ${item.label}`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </button>
            );
          })}
        </div>

        {tabBarExtraContent && <div className="ml-auto">{tabBarExtraContent}</div>}
      </div>

      {/* Tab content */}
      {activeItem?.children && (
        <div role="tabpanel" className="mt-4">
          {activeItem.children}
        </div>
      )}
    </div>
  );
}

HermesTabs.displayName = 'HermesTabs';

export default HermesTabs;
