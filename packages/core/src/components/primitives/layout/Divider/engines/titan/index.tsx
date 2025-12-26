/**
 * Divider - Titan Engine (Ant Design)
 */

import React from 'react';
import type { DividerProps } from '../../types';
import { DIVIDER_DEFAULTS, MARGIN_MAP } from '../../types';

export default function TitanDivider(props: DividerProps): React.ReactElement {
  const {
    orientation = DIVIDER_DEFAULTS.orientation,
    type = DIVIDER_DEFAULTS.type,
    children,
    margin = DIVIDER_DEFAULTS.margin,
    className,
    style,
  } = props;

  const isHorizontal = orientation === 'horizontal';

  const dividerStyle: React.CSSProperties = {
    display: isHorizontal ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isHorizontal ? '100%' : 'auto',
    height: isHorizontal ? 'auto' : '100%',
    margin: isHorizontal
      ? `${MARGIN_MAP[margin!]} 0`
      : `0 ${MARGIN_MAP[margin!]}`,
    ...style,
  };

  const lineStyle: React.CSSProperties = {
    flex: 1,
    borderTop: isHorizontal ? `1px ${type} #d9d9d9` : 'none',
    borderLeft: !isHorizontal ? `1px ${type} #d9d9d9` : 'none',
    height: isHorizontal ? '0' : '100%',
    width: isHorizontal ? '100%' : '0',
  };

  if (children) {
    return (
      <div className={className} style={dividerStyle}>
        <div style={lineStyle} />
        <span style={{ padding: '0 1rem', whiteSpace: 'nowrap' }}>
          {children}
        </span>
        <div style={lineStyle} />
      </div>
    );
  }

  return <div className={className} style={{ ...dividerStyle, ...lineStyle }} />;
}
