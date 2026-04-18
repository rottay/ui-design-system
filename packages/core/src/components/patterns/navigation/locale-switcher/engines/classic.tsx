'use client';

/**
 * @fileoverview LocaleSwitcher -- Classic engine (Ant Design).
 * Renders a locale dropdown using Ant Design's Dropdown and Menu
 * components. Supports flag + label display, size variants, and
 * marks the active locale with a check icon.
 *
 * @example
 * <ClassicLocaleSwitcher
 *   locale="en"
 *   onChange={(code) => setLocale(code)}
 * />
 */

import React, { useMemo } from 'react';
import { Button, Dropdown } from 'antd';
import { CheckOutlined, GlobalOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { LocaleSwitcherProps } from '../LocaleSwitcher.types';
import { DEFAULT_LOCALES } from '../LocaleSwitcher.types';

/**
 * Classic (Ant Design) implementation of the LocaleSwitcher pattern.
 * Uses Ant's Dropdown with a dynamically built menu. The active locale
 * is indicated by a CheckOutlined icon in the menu item.
 */
export default function ClassicLocaleSwitcher(props: LocaleSwitcherProps) {
  const {
    locale,
    onChange,
    locales = DEFAULT_LOCALES,
    size = 'md',
    showFlag = true,
    showLabel: showLabelProp,
    loading,
    className,
    style,
  } = props;

  const showLabel = showLabelProp ?? (size === 'md');
  const activeLocale = locales.find(l => l.code === locale);

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      locales.map(loc => ({
        key: loc.code,
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
            {showFlag && loc.flag && (
              <span style={{ fontSize: 16, lineHeight: 1 }}>{loc.flag}</span>
            )}
            <span style={{ flex: 1 }}>{loc.label}</span>
            {loc.code === locale && (
              <CheckOutlined style={{ color: 'var(--ds-color-primary)', fontSize: 12 }} />
            )}
          </span>
        ),
      })),
    [locales, locale, showFlag],
  );

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key !== locale) {
      onChange(key);
    }
  };

  const triggerLabel = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {showFlag && activeLocale?.flag ? (
        <span style={{ fontSize: size === 'sm' ? 14 : 16, lineHeight: 1 }}>{activeLocale.flag}</span>
      ) : (
        <GlobalOutlined />
      )}
      {showLabel && <span>{activeLocale?.label ?? locale}</span>}
      <DownOutlined style={{ fontSize: 10, opacity: 0.5 }} />
    </span>
  );

  return (
    <div
      className={`ds-pattern-locale-switcher ds-engine-classic ${className ?? ''}`}
      style={{ display: 'inline-block', ...style }}
    >
      <Dropdown
        menu={{
          items: menuItems,
          onClick: handleMenuClick,
          selectedKeys: [locale],
        }}
        trigger={['click']}
      >
        <Button
          type="text"
          size={size === 'sm' ? 'small' : 'middle'}
          loading={loading}
          aria-label={`Language: ${activeLocale?.label ?? locale}`}
          data-testid="locale-switcher-trigger"
        >
          {triggerLabel}
        </Button>
      </Dropdown>
    </div>
  );
}
