/**
 * Tabs - Apollo Engine (Pure HTML/CSS)
 */

import React, { useState } from 'react';
import type { TabsProps, TabItem, TabsSize } from '../../types';
import { TABS_DEFAULTS } from '../../types';

const SIZE_STYLES = {
  sm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },
  md: { padding: '0.5rem 1rem', fontSize: '1rem' },
  lg: { padding: '0.75rem 1.25rem', fontSize: '1.125rem' },
};

export default function ApolloTabs(props: TabsProps): React.ReactElement {
  const {
    items,
    activeKey,
    defaultActiveKey,
    type = TABS_DEFAULTS.type,
    size = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className,
    style,
  } = props;

  const [active, setActive] = useState(activeKey || defaultActiveKey || items[0]?.key);

  const handleChange = (key: string) => {
    if (!activeKey) setActive(key);
    onChange?.(key);
  };

  const currentKey = activeKey || active;
  const activeItem = items.find((item: TabItem) => item.key === currentKey);

  const tabListStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: type === 'line' ? '1px solid var(--color-neutral-200, #e5e5e5)' : undefined,
    justifyContent: centered ? 'center' : 'flex-start',
  };

  const getTabStyle = (isActive: boolean, disabled?: boolean): React.CSSProperties => ({
    ...SIZE_STYLES[size as TabsSize],
    border: 'none',
    background: isActive ? 'var(--color-primary, #0066CC)' : 'transparent',
    color: isActive ? 'white' : 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    borderRadius: type === 'card' || type === 'pills' ? '0.375rem' : '0',
    borderBottom: type === 'line' && isActive ? '2px solid var(--color-primary, #0066CC)' : undefined,
    marginBottom: type === 'line' ? '-1px' : undefined,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  return (
    <div className={className} style={style}>
      <div role="tablist" style={tabListStyle}>
        {items.map((item: TabItem) => (
          <button
            key={item.key}
            role="tab"
            style={getTabStyle(item.key === currentKey, item.disabled)}
            disabled={item.disabled}
            onClick={() => handleChange(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      {activeItem?.children && (
        <div style={{ padding: '1rem' }}>{activeItem.children}</div>
      )}
    </div>
  );
}
