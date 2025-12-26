'use client';

/**
 * Collapse - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, createContext, useContext, Children, cloneElement, isValidElement } from 'react';
import type { CollapseProps, CollapsePanelProps } from '../../types';
import { COLLAPSE_DEFAULTS } from '../../types';

interface CollapseContextValue {
  activeKeys: string[];
  toggleKey: (key: string) => void;
  accordion: boolean;
  expandIconPosition: 'start' | 'end';
  bordered: boolean;
  ghost: boolean;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

export const Panel = React.forwardRef<HTMLDivElement, CollapsePanelProps & { index?: number }>(
  (props, ref) => {
    const {
      panelKey,
      header,
      disabled = false,
      showArrow = true,
      extra,
      children,
      className = '',
      style,
      index = 0,
    } = props;

    const context = useContext(CollapseContext);
    if (!context) return null;

    const key = panelKey ?? `panel-${index}`;
    const isActive = context.activeKeys.includes(key);

    const handleClick = () => {
      if (!disabled) {
        context.toggleKey(key);
      }
    };

    const arrowIcon = showArrow && (
      <span
        className={`transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}
      >
        ▶
      </span>
    );

    return (
      <div
        ref={ref}
        className={`collapse ${context.bordered ? 'border border-base-300' : ''} ${
          context.ghost ? 'bg-transparent' : 'bg-base-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        style={style}
      >
        <div
          className={`collapse-title flex items-center gap-2 cursor-pointer ${
            disabled ? 'pointer-events-none' : ''
          }`}
          onClick={handleClick}
        >
          {context.expandIconPosition === 'start' && arrowIcon}
          <span className="flex-1">{header}</span>
          {extra && <span className="ml-auto">{extra}</span>}
          {context.expandIconPosition === 'end' && arrowIcon}
        </div>
        <div
          className={`collapse-content overflow-hidden transition-all duration-200 ${
            isActive ? 'max-h-screen py-4' : 'max-h-0'
          }`}
        >
          {children}
        </div>
      </div>
    );
  }
);
Panel.displayName = 'Collapse.Panel.Hermes';

export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (props, ref) => {
    const {
      activeKey,
      defaultActiveKey,
      accordion = COLLAPSE_DEFAULTS.accordion,
      bordered = COLLAPSE_DEFAULTS.bordered,
      ghost = false,
      expandIconPosition = COLLAPSE_DEFAULTS.expandIconPosition,
      onChange,
      children,
      className = '',
      style,
    } = props;

    const normalizeKeys = (keys: string | string[] | undefined): string[] => {
      if (!keys) return [];
      return Array.isArray(keys) ? keys : [keys];
    };

    const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(
      normalizeKeys(defaultActiveKey)
    );

    const activeKeys = activeKey !== undefined ? normalizeKeys(activeKey) : internalActiveKeys;

    const toggleKey = (key: string) => {
      let newKeys: string[];

      if (accordion) {
        newKeys = activeKeys.includes(key) ? [] : [key];
      } else {
        newKeys = activeKeys.includes(key)
          ? activeKeys.filter((k) => k !== key)
          : [...activeKeys, key];
      }

      if (activeKey === undefined) {
        setInternalActiveKeys(newKeys);
      }
      onChange?.(accordion ? newKeys[0] ?? '' : newKeys);
    };

    const childArray = Children.toArray(children);

    return (
      <CollapseContext.Provider
        value={{ activeKeys, toggleKey, accordion, expandIconPosition, bordered, ghost }}
      >
        <div
          ref={ref}
          className={`flex flex-col gap-1 ${className}`}
          style={style}
        >
          {childArray.map((child, index) =>
            isValidElement(child)
              ? cloneElement(child as React.ReactElement<CollapsePanelProps & { index?: number }>, { index })
              : child
          )}
        </div>
      </CollapseContext.Provider>
    );
  }
);
Collapse.displayName = 'Collapse.Hermes';

export default Collapse;
