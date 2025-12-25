/**
 * Titan Engine - Grid Components (Row/Col)
 *
 * Wraps Ant Design's Row and Col components.
 */

'use client';

import React from 'react';
import { Row as AntRow, Col as AntCol } from 'antd';
import type { RowProps, ColProps } from '../types';

// Map simplified justify values to AntD values
const justifyMap: Record<string, string> = {
  start: 'start',
  end: 'end',
  center: 'center',
  'space-around': 'space-around',
  'space-between': 'space-between',
  'space-evenly': 'space-evenly',
};

// Map simplified align values to AntD values
const alignMap: Record<string, string> = {
  top: 'top',
  middle: 'middle',
  bottom: 'bottom',
  stretch: 'stretch',
};

const TitanRow: React.FC<RowProps> = ({
  children,
  className,
  style,
  gutter,
  justify,
  align,
  wrap = true,
}) => {
  return (
    <AntRow
      className={className}
      style={style}
      gutter={gutter}
      justify={justify ? justifyMap[justify] as any : undefined}
      align={align ? alignMap[align] as any : undefined}
      wrap={wrap}
    >
      {children}
    </AntRow>
  );
};

TitanRow.displayName = 'TitanRow';

const TitanCol: React.FC<ColProps> = ({
  children,
  className,
  style,
  span,
  offset,
  order,
  pull,
  push,
  flex,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
}) => {
  return (
    <AntCol
      className={className}
      style={style}
      span={span}
      offset={offset}
      order={order}
      pull={pull}
      push={push}
      flex={flex}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      xxl={xxl}
    >
      {children}
    </AntCol>
  );
};

TitanCol.displayName = 'TitanCol';

export { TitanRow, TitanCol };
export default TitanRow;
