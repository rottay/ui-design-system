/**
 * Hermes Engine - Grid Components (Row/Col)
 *
 * DaisyUI + Tailwind implementation of 24-column grid.
 */

'use client';

import React from 'react';
import type { RowProps, ColProps } from '../types';
import { parseGutter, getColWidth } from '../types';

// Justify class mapping
const justifyClasses: Record<string, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-around': 'justify-around',
  'space-between': 'justify-between',
  'space-evenly': 'justify-evenly',
};

// Align class mapping
const alignClasses: Record<string, string> = {
  top: 'items-start',
  middle: 'items-center',
  bottom: 'items-end',
  stretch: 'items-stretch',
};

interface HermesColInternalProps extends ColProps {
  _gutter?: number;
}

const HermesRow: React.FC<RowProps> = ({
  children,
  className = '',
  style,
  gutter,
  justify,
  align,
  wrap = true,
}) => {
  const [hGutter, vGutter] = parseGutter(gutter);

  const classes = [
    'flex',
    wrap ? 'flex-wrap' : 'flex-nowrap',
    justify ? justifyClasses[justify] : '',
    align ? alignClasses[align] : '',
    className,
  ].filter(Boolean).join(' ');

  const rowStyle: React.CSSProperties = {
    marginLeft: hGutter ? `-${hGutter / 2}px` : undefined,
    marginRight: hGutter ? `-${hGutter / 2}px` : undefined,
    rowGap: vGutter ? `${vGutter}px` : undefined,
    ...style,
  };

  // Pass gutter to children via context-like pattern
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        _gutter: hGutter,
      });
    }
    return child;
  });

  return (
    <div className={classes} style={rowStyle}>
      {enhancedChildren}
    </div>
  );
};

HermesRow.displayName = 'HermesRow';

const HermesCol: React.FC<HermesColInternalProps> = ({
  children,
  className = '',
  style,
  span,
  offset,
  order,
  flex,
  _gutter,
}) => {
  const width = getColWidth(span);
  const offsetWidth = getColWidth(offset);

  const classes = [
    'box-border',
    className,
  ].filter(Boolean).join(' ');

  const colStyle: React.CSSProperties = {
    width: span !== undefined ? width : undefined,
    flex: flex !== undefined ? flex : (span !== undefined ? `0 0 ${width}` : undefined),
    maxWidth: span !== undefined ? width : undefined,
    marginLeft: offset ? offsetWidth : undefined,
    paddingLeft: _gutter ? `${_gutter / 2}px` : undefined,
    paddingRight: _gutter ? `${_gutter / 2}px` : undefined,
    order: order,
    ...style,
  };

  return (
    <div className={classes} style={colStyle}>
      {children}
    </div>
  );
};

HermesCol.displayName = 'HermesCol';

export { HermesRow, HermesCol };
export default HermesRow;
