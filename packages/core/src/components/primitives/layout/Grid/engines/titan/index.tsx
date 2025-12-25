/**
 * Grid - Titan Engine (Ant Design)
 */

import React from 'react';
import type { GridProps } from '../types';
import { GRID_DEFAULTS, GAP_MAP } from '../types';

export default function TitanGrid(props: GridProps): React.ReactElement {
  const {
    children,
    columns = GRID_DEFAULTS.columns,
    gap = GRID_DEFAULTS.gap,
    rowGap,
    columnGap,
    className,
    style,
  } = props;

  const combinedStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: GAP_MAP[gap!],
    rowGap: rowGap ? GAP_MAP[rowGap] : undefined,
    columnGap: columnGap ? GAP_MAP[columnGap] : undefined,
    ...style,
  };

  return (
    <div className={className} style={combinedStyle}>
      {children}
    </div>
  );
}
