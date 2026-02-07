'use client';

import React, { useState, useRef } from 'react';
import { createPreset } from '../../../factory';
import type { SplitLayoutProps } from '../../core';
import { SPLIT_LAYOUT_DEFAULTS } from '../../core';

export default createPreset<SplitLayoutProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const {
    left,
    right,
    initialSplit = SPLIT_LAYOUT_DEFAULTS.initialSplit,
    minWidth = SPLIT_LAYOUT_DEFAULTS.minWidth,
    orientation = SPLIT_LAYOUT_DEFAULTS.orientation,
    className,
    style,
  } = props;

  const [split, setSplit] = useState(initialSplit);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    if (orientation === 'horizontal') {
      const newSplit = ((e.clientX - rect.left) / rect.width) * 100;
      const minPercent = (minWidth / rect.width) * 100;
      const maxPercent = 100 - minPercent;
      setSplit(Math.max(minPercent, Math.min(maxPercent, newSplit)));
    } else {
      const newSplit = ((e.clientY - rect.top) / rect.height) * 100;
      const minPercent = (minWidth / rect.height) * 100;
      const maxPercent = 100 - minPercent;
      setSplit(Math.max(minPercent, Math.min(maxPercent, newSplit)));
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        width: '100%',
        height: '100%',
        ...style,
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Left/Top Panel */}
      <Box
        style={{
          width: orientation === 'horizontal' ? `${split}%` : '100%',
          height: orientation === 'vertical' ? `${split}%` : '100%',
          overflow: 'auto',
        }}
      >
        {left}
      </Box>

      {/* Divider */}
      <Box
        onMouseDown={handleMouseDown}
        style={{
          width: orientation === 'horizontal' ? '4px' : '100%',
          height: orientation === 'vertical' ? '4px' : '100%',
          backgroundColor: isDragging ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200],
          cursor: orientation === 'horizontal' ? 'col-resize' : 'row-resize',
          transition: isDragging ? 'none' : `background-color ${tokens.motion.hover}`,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[300];
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.backgroundColor = tokens.colors.neutral[200];
          }
        }}
      />

      {/* Right/Bottom Panel */}
      <Box
        style={{
          width: orientation === 'horizontal' ? `${100 - split}%` : '100%',
          height: orientation === 'vertical' ? `${100 - split}%` : '100%',
          overflow: 'auto',
        }}
      >
        {right}
      </Box>
    </div>
  );
});
