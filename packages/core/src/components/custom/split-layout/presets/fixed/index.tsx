'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { SplitLayoutProps } from '../../core';
import { SPLIT_LAYOUT_DEFAULTS } from '../../core';

export default createPreset<SplitLayoutProps>((context) => {
  const { primitives, props } = context;
  const { Box } = primitives;
  const {
    left,
    right,
    initialSplit = SPLIT_LAYOUT_DEFAULTS.initialSplit,
    orientation = SPLIT_LAYOUT_DEFAULTS.orientation,
    className,
    style,
  } = props;

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      {/* Left/Top Panel */}
      <Box
        style={{
          width: orientation === 'horizontal' ? `${initialSplit}%` : '100%',
          height: orientation === 'vertical' ? `${initialSplit}%` : '100%',
          overflow: 'auto',
        }}
      >
        {left}
      </Box>

      {/* Right/Bottom Panel */}
      <Box
        style={{
          width: orientation === 'horizontal' ? `${100 - initialSplit}%` : '100%',
          height: orientation === 'vertical' ? `${100 - initialSplit}%` : '100%',
          overflow: 'auto',
        }}
      >
        {right}
      </Box>
    </Box>
  );
});
