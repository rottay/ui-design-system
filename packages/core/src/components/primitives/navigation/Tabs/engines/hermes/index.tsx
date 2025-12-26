/**
 * Tabs - Hermes Engine (DaisyUI)
 */

import React, { useState } from 'react';
import type { TabsProps, TabItem, TabsType, TabsSize } from '../../types';
import { TABS_DEFAULTS } from '../../types';

const TYPE_CLASSES = {
  line: 'tabs-bordered',
  card: 'tabs-boxed',
  pills: 'tabs-boxed',
};

const SIZE_CLASSES = {
  sm: 'tabs-sm',
  md: '',
  lg: 'tabs-lg',
};

export default function HermesTabs(props: TabsProps): React.ReactElement {
  const {
    items,
    activeKey,
    defaultActiveKey,
    type = TABS_DEFAULTS.type,
    size = TABS_DEFAULTS.size,
    centered = TABS_DEFAULTS.centered,
    onChange,
    className = '',
    style,
  } = props;

  const [active, setActive] = useState(activeKey || defaultActiveKey || items[0]?.key);

  const handleChange = (key: string) => {
    if (!activeKey) setActive(key);
    onChange?.(key);
  };

  const currentKey = activeKey || active;
  const activeItem = items.find((item: TabItem) => item.key === currentKey);

  return (
    <div className={className} style={style}>
      <div
        role="tablist"
        className={`tabs ${TYPE_CLASSES[type as TabsType]} ${SIZE_CLASSES[size as TabsSize]} ${centered ? 'justify-center' : ''}`}
      >
        {items.map((item: TabItem) => (
          <button
            key={item.key}
            role="tab"
            className={`tab ${item.key === currentKey ? 'tab-active' : ''}`}
            disabled={item.disabled}
            onClick={() => handleChange(item.key)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      {activeItem?.children && (
        <div className="p-4">{activeItem.children}</div>
      )}
    </div>
  );
}
