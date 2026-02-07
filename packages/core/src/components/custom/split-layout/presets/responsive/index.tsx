'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    className,
    style,
  } = props;

  const [isSmall, setIsSmall] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        setIsSmall(containerRef.current.offsetWidth < 768);
      }
    };

    checkSize();
    const observer = new ResizeObserver(checkSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: isSmall ? 'column' : 'row',
        width: '100%',
        height: '100%',
        gap: isSmall ? tokens.spacing[4] : 0,
        ...style,
      }}
    >
      {/* Left Panel */}
      <Box
        style={{
          width: isSmall ? '100%' : `${initialSplit}%`,
          height: isSmall ? 'auto' : '100%',
          overflow: 'auto',
        }}
      >
        {left}
      </Box>

      {/* Right Panel */}
      <Box
        style={{
          width: isSmall ? '100%' : `${100 - initialSplit}%`,
          height: isSmall ? 'auto' : '100%',
          overflow: 'auto',
        }}
      >
        {right}
      </Box>
    </div>
  );
});
