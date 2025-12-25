/**
 * Titan Tabs Engine
 *
 * Adapter that converts unified TabsProps to Ant Design Tabs.
 */

'use client';

import { Tabs as AntTabs } from 'antd';
import type { TabsProps } from '../../../../types/components/tabs';

/**
 * Titan Tabs - Ant Design implementation with unified TabsProps
 */
function TitanTabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  className,
  style,
  id,
  type,
  size,
  tabPosition,
  centered,
  onEdit,
  tabBarExtraContent,
  tabBarGutter,
  tabBarStyle,
  animated,
  destroyInactiveTabPane,
  onTabClick,
  'aria-label': ariaLabel,
}: TabsProps) {
  // Map unified size to AntD size (AntD uses 'small', 'middle', 'large')
  const antSize = size === 'default' ? 'middle' : size;

  // Wrap onEdit to match AntD signature
  // AntD: (targetKey: string | MouseEvent | KeyboardEvent, action: 'add' | 'remove') => void
  // Unified: (targetKey: Key, action: 'add' | 'remove') => void
  const handleEdit = onEdit
    ? (targetKey: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
        // Extract key from event if it's an event object
        const key = typeof targetKey === 'string' ? targetKey : '';
        onEdit(key, action);
      }
    : undefined;

  return (
    <AntTabs
      items={items}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
      className={className}
      style={style}
      id={id}
      type={type}
      size={antSize}
      tabPosition={tabPosition}
      centered={centered}
      onEdit={handleEdit}
      tabBarExtraContent={tabBarExtraContent}
      tabBarGutter={tabBarGutter}
      tabBarStyle={tabBarStyle}
      animated={animated}
      destroyInactiveTabPane={destroyInactiveTabPane}
      onTabClick={onTabClick}
      aria-label={ariaLabel}
    />
  );
}

TitanTabs.displayName = 'TitanTabs';

export default TitanTabs;
