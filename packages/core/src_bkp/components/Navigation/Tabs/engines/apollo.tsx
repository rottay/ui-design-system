/**
 * Apollo Tabs Engine
 *
 * Native HTML + Tailwind CSS tabs implementation.
 * Zero external dependencies, minimal bundle size.
 */

'use client';

import { useState } from 'react';
import type { TabsProps } from '../../../../types/components/tabs';
import { cn } from '../../../../utils/cn';

const sizeStyles = {
  small: 'text-xs px-3 py-1.5',
  default: 'text-sm px-4 py-2',
  large: 'text-base px-5 py-2.5',
};

const typeStyles = {
  line: {
    container: 'border-b border-gray-200',
    tab: 'border-b-2 border-transparent hover:border-gray-300',
    activeTab: 'border-blue-600 text-blue-600',
    inactiveTab: 'text-gray-500 hover:text-gray-700',
  },
  card: {
    container: 'border-b border-gray-200',
    tab: 'border border-gray-200 border-b-0 rounded-t-lg -mb-px',
    activeTab: 'bg-white border-b-white text-blue-600',
    inactiveTab: 'bg-gray-50 text-gray-500 hover:text-gray-700',
  },
  'editable-card': {
    container: 'border-b border-gray-200',
    tab: 'border border-gray-200 border-b-0 rounded-t-lg -mb-px group',
    activeTab: 'bg-white border-b-white text-blue-600',
    inactiveTab: 'bg-gray-50 text-gray-500 hover:text-gray-700',
  },
};

/**
 * Apollo Tabs - Native HTML + Tailwind implementation
 */
function ApolloTabs({
  items = [],
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  style,
  id,
  type = 'line',
  size = 'default',
  centered = false,
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

  const styles = typeStyles[type] ?? typeStyles.line;
  const tabSizeStyle = sizeStyles[size] ?? sizeStyles.default;

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

  const activeItem = items.find((item) => item.key === currentActiveKey);

  return (
    <div className={cn('w-full', className)} style={style} id={id}>
      {/* Tab bar */}
      <div
        className={cn('flex items-end gap-1', styles.container, centered && 'justify-center')}
        role="tablist"
        aria-label={ariaLabel}
      >
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
              className={cn(
                'relative flex items-center gap-2 font-medium transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                tabSizeStyle,
                styles.tab,
                isActive ? styles.activeTab : styles.inactiveTab,
                item.disabled && 'opacity-50 cursor-not-allowed',
                !item.disabled && 'cursor-pointer'
              )}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
              {type === 'editable-card' && item.closable !== false && (
                <button
                  type="button"
                  onClick={(e) => handleClose(item.key, e)}
                  className={cn(
                    'ml-2 -mr-1 rounded p-0.5 hover:bg-gray-200',
                    'opacity-0 group-hover:opacity-100 transition-opacity'
                  )}
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

        {tabBarExtraContent && (
          <div className="ml-auto flex items-center">{tabBarExtraContent}</div>
        )}
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

ApolloTabs.displayName = 'ApolloTabs';

export default ApolloTabs;
