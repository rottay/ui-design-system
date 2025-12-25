/**
 * Tabs - Titan Engine (Ant Design)
 */

import React from 'react';
import { Tabs as AntTabs } from 'antd';
import type { TabsProps } from '../types';
import { TABS_DEFAULTS } from '../types';

const TYPE_MAP = {
  line: 'line' as const,
  card: 'card' as const,
  pills: 'card' as const,
};

const SIZE_MAP = {
  sm: 'small' as const,
  md: 'middle' as const,
  lg: 'large' as const,
};

export default function TitanTabs(props: TabsProps): React.ReactElement {
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

  const antItems = items.map((item) => ({
    key: item.key,
    label: (
      <>
        {item.icon} {item.label}
      </>
    ),
    children: item.children,
    disabled: item.disabled,
  }));

  return (
    <AntTabs
      items={antItems}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      type={TYPE_MAP[type!]}
      size={SIZE_MAP[size!]}
      centered={centered}
      onChange={onChange}
      className={className}
      style={style}
    />
  );
}
